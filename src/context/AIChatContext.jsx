import React, { createContext, useContext, useState, useCallback } from 'react';

const AIChatContext = createContext();

const SYSTEM_PROMPT = `You are an AI insurance policy advisor for AnalyzeMyPolicy, a platform that helps families monitor and optimize their life insurance portfolios.

The user's current portfolio:
- MetLife Whole Life: $1.5M coverage, $580/mo premium, ~$103,800 cash value (est.), score 82/100. Beneficiary: Sarah Harrison. Issued 2015.
- Protective 20-Year Term: $500K coverage, $267/mo premium, no cash value, score 68/100. Expires 2040. Conversion window opens 2030.

Portfolio summary: $2M total coverage, $847/mo combined premium, portfolio score 76/100.

Key action items:
1. (HIGH) Consider converting the Protective term policy before the 2030 conversion window — locking in current health rating means no new medical exam.
2. (MEDIUM) Beneficiary designations haven't been reviewed since 2018 — should be updated after any life events.
3. (MEDIUM) $500K term coverage may be insufficient as household income has grown.

Answer questions about these policies clearly and concisely in 2–4 sentences. Use **bold** for key numbers and terms. Do not give financial or legal advice — frame recommendations as informational. If asked about something outside this portfolio, say you can only discuss the user's current policies.`;

const MOCK_RESPONSES = {
  'cash value': `Your **MetLife Whole Life** policy currently has an estimated cash value of **$103,800**. It's projected to reach **$146K by 2030** and **$312K by 2040**. You can access this via a policy loan (tax-free) or full surrender — though surrendering ends your coverage.`,
  'premium': `Your combined monthly premium across both policies is **$847/month**. Your MetLife premium ($580/mo) is due **May 1** and your Protective Term ($267/mo) renews annually. Both are within normal range for your coverage level.`,
  'score': `Your portfolio score is **76/100**. The main items holding it back are: (1) beneficiary designations not reviewed recently, and (2) your term policy's conversion window opening in 2030 needs a plan. Addressing these could push your score above 85.`,
  'beneficiar': `Your MetLife policy lists **Sarah Harrison** as primary beneficiary. Your Protective Term lists the same. We recommend reviewing annually — especially after life events. Updates are free and take under 10 minutes with your carrier.`,
  'convert': `Your Protective 20-Year Term has a conversion option that opens **April 2030**. Converting before any health changes lets you lock in your current health rating — no new medical exam required. The longer you wait, the higher the permanent premium.`,
  'portfolio': `Your portfolio covers **$2M** in death benefit across 2 active policies. Total monthly premium: **$847**. Estimated cash value: **$103.8K** (growing). Key action: plan the Protective Term conversion before 2030 while your health rating is strong.`,
};

const getMockResponse = (question) => {
  const q = question.toLowerCase();
  for (const [key, val] of Object.entries(MOCK_RESPONSES)) {
    if (q.includes(key)) return val;
  }
  return `Great question about your policy portfolio. Your current coverage of **$2M** is active and in good standing. The most important action right now is reviewing your beneficiary designations and planning for the **term conversion in 2030**. Would you like me to walk through either in detail?`;
};

const callClaude = async (messages) => {
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
        system: SYSTEM_PROMPT,
        messages: messages
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .slice(-10) // last 10 messages for context
          .map((m) => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content.replace(/\*\*/g, '**'), // keep bold markers
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

export const AIChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [activeSid, setActiveSid] = useState('sess-1');
  const [isTyping, setIsTyping] = useState(false);

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

    // Optimistically add user message
    let currentMessages = [];
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSid) return s;
        const updated = { ...s, messages: [...s.messages, userMsg], preview: text.slice(0, 60) };
        currentMessages = updated.messages;
        return updated;
      })
    );

    setIsTyping(true);

    // Try Claude API, fall back to mock
    const reply = (await callClaude(currentMessages)) ?? getMockResponse(text);

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
  }, [activeSid, isTyping]);

  return (
    <AIChatContext.Provider value={{ isOpen, toggle, open, sessions, activeSid, setActiveSid, activeSession, newSession, sendMessage, isTyping }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => useContext(AIChatContext);
