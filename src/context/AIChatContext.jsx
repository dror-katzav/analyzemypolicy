import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_POLICIES } from '../data/mockData';

const AIChatContext = createContext();

const policy = MOCK_POLICIES[0];

const getMockResponse = (question) => {
  const q = question.toLowerCase();
  if (q.includes('cash value') || q.includes('cv'))
    return `Your **MetLife Whole Life** policy currently has an estimated cash value of **$48,200**. It's projected to reach **$146K by 2030** and **$312K by 2040**. You can access this via a policy loan (tax-free) or full surrender — though surrendering ends your coverage.`;
  if (q.includes('premium') || q.includes('payment'))
    return `Your combined monthly premium across both policies is **$847/month**. Your MetLife premium ($580/mo) is due **May 1, 2026** and your Protective Term ($267/mo) renews annually. Both are within normal range for your coverage level.`;
  if (q.includes('score') || q.includes('grade') || q.includes('rating'))
    return `Your portfolio score is **76/100**. The main items holding it back are: (1) beneficiary designations not reviewed since 2018, and (2) your term policy's conversion window opening in 2030 needs a plan. Addressing these could push your score above 85.`;
  if (q.includes('beneficiar'))
    return `Your MetLife policy lists **Sarah Harrison** as primary beneficiary. Your Protective Term lists the same. We recommend reviewing beneficiary designations annually — especially after life events like marriage, divorce, or a new child. Updates are free and take under 10 minutes.`;
  if (q.includes('convert') || q.includes('conversion'))
    return `Your Protective 20-Year Term policy has a conversion option that opens **April 2030**. Converting before any health changes lets you lock in your current health rating — no new medical exam required. The longer you wait, the higher the permanent premium. I'd recommend planning this 12-18 months in advance.`;
  if (q.includes('portfolio') || q.includes('overview') || q.includes('summary'))
    return `Your portfolio covers **$2M** in death benefit across 2 active policies. Total monthly premium: **$847**. Estimated cash value: **$48.2K** (growing). One key action item: your Protective Term conversion window opens in 2030 — we should plan for that now while your health rating is strong.`;
  return `Great question about your policy portfolio. Your current coverage of **$2M** is active and in good standing. The most important action right now is reviewing your beneficiary designations and planning for the **term conversion in 2030**. Would you like me to walk through either of those in detail?`;
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
      { role: 'model', content: `Your **MetLife Whole Life** policy currently has an estimated cash value of **$48,200**. It's projected to reach **$146K by 2030** and **$312K by 2040**. You can access this via a policy loan (tax-free) or full surrender — though surrendering ends your coverage.` },
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
      { role: 'model', content: `Your Protective 20-Year Term policy has a conversion option that opens **April 2030**. Converting before any health changes lets you lock in your current health rating — no new medical exam required. The longer you wait, the higher the permanent premium. I'd recommend planning this 12-18 months in advance.` },
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

  const sendMessage = useCallback((text) => {
    if (!text.trim() || isTyping) return;
    const userMsg = { role: 'user', content: text };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSid
          ? { ...s, messages: [...s.messages, userMsg], preview: text.slice(0, 60) }
          : s
      )
    );

    setIsTyping(true);
    setTimeout(() => {
      const reply = getMockResponse(text);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSid
            ? {
                ...s,
                messages: [...s.messages, userMsg, { role: 'model', content: reply }],
                preview: reply.replace(/\*\*/g, '').slice(0, 60) + '…',
                title: s.title === 'New conversation' ? text.slice(0, 36) : s.title,
              }
            : s
        )
      );
      setIsTyping(false);
    }, 1100);
  }, [activeSid, isTyping]);

  return (
    <AIChatContext.Provider value={{ isOpen, toggle, open, sessions, activeSid, setActiveSid, activeSession, newSession, sendMessage, isTyping }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => useContext(AIChatContext);
