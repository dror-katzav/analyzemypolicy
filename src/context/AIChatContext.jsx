/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { usePolicies } from './PoliciesContext';

const AIChatContext = createContext();

// ─── System prompt builder ────────────────────────────────────────────────────

const buildSystemPrompt = (policies) => {
  const hasPolicies = policies && policies.length > 0;

  if (!hasPolicies) {
    return `You are an AI insurance policy advisor for AnalyzeMyPolicy.
The user has not yet uploaded any policies. Encourage them to upload a policy document via the Documents page or use the Analyze flow to get a full analysis. You can answer general life insurance questions in the meantime.
Keep answers to 2–4 sentences. Use **bold** for key terms. Do not give financial or legal advice.`;
  }

  const totalCoverage = policies.reduce((s, p) => s + (p.faceAmount ?? 0), 0);
  const totalPremium = policies.reduce((s, p) => s + (p.premium ?? 0), 0);
  const avgScore = Math.round(policies.reduce((s, p) => s + (p.score ?? 0), 0) / policies.length);

  const policyLines = policies.map((p) => {
    const cv = p.cashValue > 0 ? `, ~$${p.cashValue.toLocaleString()} cash value` : '';
    return `- ${p.name}: $${(p.faceAmount / 1_000_000).toFixed(1)}M coverage, $${p.premium}/mo premium${cv}, score ${p.score ?? '?'}/100. Carrier: ${p.carrier}. Issued ${p.issueDate?.slice(0, 7) ?? 'unknown'}.`;
  });

  const allOpps = policies.flatMap((p) =>
    (p.opportunities ?? []).map((o) => `(${o.severity?.toUpperCase()}) [${p.shortName}] ${o.title}`)
  );

  return `You are an AI insurance policy advisor for AnalyzeMyPolicy, a platform that helps families monitor and optimize their life insurance portfolios.

The user's current portfolio (${policies.length} polic${policies.length === 1 ? 'y' : 'ies'}):
${policyLines.join('\n')}

Portfolio summary: $${(totalCoverage / 1_000_000).toFixed(1)}M total coverage, $${totalPremium}/mo combined premium, average score ${avgScore}/100.

Key action items identified:
${allOpps.length > 0 ? allOpps.map((o, i) => `${i + 1}. ${o}`).join('\n') : 'None — portfolio is in good shape.'}

Answer questions about these policies clearly and concisely in 2–4 sentences. Use **bold** for key numbers and terms. Do not give financial or legal advice — frame recommendations as informational. If asked about something outside this portfolio, say you can only discuss the user's current policies.`;
};

// ─── Mock responses ───────────────────────────────────────────────────────────

const MOCK_RESPONSES = {
  'cash value': `Your **MetLife Whole Life** policy currently has an estimated cash value of **$103,800**. It's projected to reach **$146K by 2030** and **$312K by 2040**. You can access this via a policy loan (tax-free) or full surrender — though surrendering ends your coverage.`,
  'premium': `Your combined monthly premium across both policies is **$847/month**. Your MetLife premium ($580/mo) is due **Jun 1** and your Protective Term ($267/mo) is due **May 28**. Both are within normal range for your coverage level.`,
  'score': `Your portfolio score is **76/100**. The main items holding it back are: (1) beneficiary designations not reviewed recently, and (2) your term policy's conversion window opening in 2030 needs a plan. Addressing these could push your score above 85.`,
  'beneficiar': `Your MetLife policy lists **Sarah Harrison** as primary beneficiary. Your Protective Term lists the same. We recommend reviewing annually — especially after life events. Updates are free and take under 10 minutes with your carrier.`,
  'convert': `Your Protective 20-Year Term has a conversion option that opens **April 2030**. Converting before any health changes lets you lock in your current health rating — no new medical exam required. The longer you wait, the higher the permanent premium.`,
  'portfolio': `Your portfolio covers **$2M** in death benefit across 2 active policies. Total monthly premium: **$847**. Estimated cash value: **$103.8K** (growing). Key action: plan the Protective Term conversion before 2030 while your health rating is strong.`,
  'nexus': `Atidot Nexus has analyzed your portfolio. Your **MetLife Whole Life** has a **Low (9%)** lapse risk — it's performing well. Your **Protective Term** has a **Medium (31%)** lapse risk, which is expected for term policies approaching mid-life. Nexus recommends planning the conversion to Whole Life before 2030.`,
  'lapse': `Atidot Nexus shows your **MetLife Whole Life** has only a **9% lapse probability** — very low risk. Your **Protective Term** has a **31% lapse probability** over the next 3 years, primarily because term policies without conversion plans are more likely to be dropped. Converting to permanent coverage reduces this risk significantly.`,
  'rate': `Based on current market data, comparable **$500K 20-year term** coverage could be available for **$185–220/month** — potentially **$47–82/month less** than your current $267 premium. Rates have declined since 2020 and your age profile is competitive. A quick comparison takes under 5 minutes.`,
};

const getMockResponse = (question) => {
  const q = question.toLowerCase();
  for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
    if (q.includes(key)) return val;
  }
  return `Great question about your policy portfolio. Your current coverage of **$2M** is active and in good standing. The most important action right now is reviewing your beneficiary designations and planning for the **term conversion in 2030**. Would you like me to walk through either in detail?`;
};

// ─── LLM API calls ────────────────────────────────────────────────────────────

/**
 * Vercel serverless proxy — tried first.
 * Uses server-side OPENAI_API_KEY / ANTHROPIC_API_KEY so keys never reach
 * the browser bundle.  Falls back gracefully when not running on Vercel.
 */
const callProxy = async (messages, systemPrompt) => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text ?? null;
  } catch {
    return null;
  }
};

/** OpenAI GPT — fallback for local dev when VITE_OPENAI_API_KEY is set */
const callOpenAI = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
            .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
            .slice(-10)
            .map((m) => ({
              role: m.role === 'model' ? 'assistant' : m.role,
              content: m.content,
            })),
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
};

/** Anthropic Claude — local dev fallback when VITE_ANTHROPIC_API_KEY is set */
const callClaude = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: messages
          .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
          .slice(-10)
          .map((m) => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content,
          })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
};

// ─── Default sessions ─────────────────────────────────────────────────────────

const makeWelcomeSession = () => ({
  id: 'sess-welcome',
  title: 'AI Policy Advisor',
  preview: 'Ask me anything about your coverage…',
  date: new Date().toISOString().slice(0, 10),
  messages: [
    {
      role: 'model',
      content: `Hi! I'm your AI Policy Advisor. I've reviewed your portfolio and have insights from Atidot Nexus. Ask me about your coverage, cash value, lapse risk, or any opportunities. What's on your mind?`,
    },
  ],
});

const INITIAL_SESSIONS = [
  {
    id: 'sess-1',
    title: 'MetLife cash value questions',
    preview: 'Your cash value is projected to reach $146K by 2030…',
    date: '2026-04-28',
    messages: [
      { role: 'model', content: `Hi! I've reviewed your **MetLife Whole Life** policy. I can answer questions about your coverage, cash value, premiums, milestones, or options. What would you like to know?` },
      { role: 'user', content: 'What is my current cash value?' },
      { role: 'model', content: MOCK_RESPONSES['cash value'] },
    ],
  },
  {
    id: 'sess-2',
    title: 'Term conversion planning',
    preview: 'The conversion window opens April 2030…',
    date: '2026-04-22',
    messages: [
      { role: 'model', content: `Hi! I'm here to help with your insurance questions. What would you like to know about your policies?` },
      { role: 'user', content: 'Should I convert my term policy?' },
      { role: 'model', content: MOCK_RESPONSES['convert'] },
    ],
  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const chatStorageKey = (user) =>
  user && !user.isGuest ? `amp_chat_v2_${user.email}` : null;

const loadSessions = (key) => {
  if (!key) return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [makeWelcomeSession()]; // new real user — blank slate with greeting
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [makeWelcomeSession()];
  } catch {
    return [makeWelcomeSession()];
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AIChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { policies } = usePolicies();
  const key = chatStorageKey(user);

  // Rebuild system prompt whenever user's actual policies change
  const systemPrompt = useMemo(() => buildSystemPrompt(policies), [policies]);

  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState(() => loadSessions(key));
  const [activeSid, setActiveSid] = useState(() => {
    const initial = loadSessions(key);
    return initial[0]?.id ?? 'sess-welcome';
  });
  const [isTyping, setIsTyping] = useState(false);

  // Reload sessions when user changes
  // Standard React pattern: adjusting state directly during render when prop/context dependency changes
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    const next = loadSessions(key);
    setSessions(next);
    setActiveSid(next[0]?.id ?? 'sess-welcome');
  }

  // Persist sessions whenever they change (real users only)
  useEffect(() => {
    if (key) {
      try { localStorage.setItem(key, JSON.stringify(sessions)); } catch { /* quota */ }
    }
  }, [sessions, key]);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open = useCallback(() => setIsOpen(true), []);

  const activeSession = sessions.find((s) => s.id === activeSid) ?? sessions[0];

  const newSession = useCallback(() => {
    const id = 'sess-' + Date.now();
    const session = {
      id,
      title: 'New conversation',
      preview: '',
      date: new Date().toISOString().slice(0, 10),
      messages: [
        { role: 'model', content: `Hi! I'm your AI Policy Advisor. Ask me anything about your coverage, premiums, cash value, or options. What's on your mind?` },
      ],
    };
    setSessions((prev) => [session, ...prev]);
    setActiveSid(id);
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', content: text };
    // Compute the updated message list before calling setSessions so we don't
    // capture a side-effect inside the React state updater (which may run twice
    // in StrictMode dev builds).
    const currentMessages = [...(activeSession?.messages ?? []), userMsg];

    setSessions((prev) =>
      prev.map((s) =>
        s.id !== activeSid
          ? s
          : { ...s, messages: currentMessages, preview: text.slice(0, 60) }
      )
    );

    setIsTyping(true);

    // Try proxy → OpenAI (direct) → Claude (direct) → mock
    // Proxy uses server-side env vars; direct calls use VITE_ keys for local dev
    const reply =
      (await callProxy(currentMessages, systemPrompt)) ??
      (await callOpenAI(currentMessages, systemPrompt)) ??
      (await callClaude(currentMessages, systemPrompt)) ??
      getMockResponse(text);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSid) return s;
        const msgs = [...s.messages, { role: 'model', content: reply }];
        return {
          ...s,
          messages: msgs,
          preview: reply.replace(/\*\*/g, '').slice(0, 60) + '…',
          title: s.title === 'New conversation' ? text.slice(0, 36) : s.title,
        };
      })
    );

    setIsTyping(false);
  }, [activeSid, isTyping, activeSession, systemPrompt]);

  return (
    <AIChatContext.Provider value={{
      isOpen, toggle, open,
      sessions, activeSid, setActiveSid, activeSession,
      newSession, sendMessage, isTyping,
    }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => useContext(AIChatContext);
