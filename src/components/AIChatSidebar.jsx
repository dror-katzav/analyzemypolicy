import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Bot, User, Send, Plus, MessageSquare, Clock } from 'lucide-react';
import { useAIChat } from '../context/AIChatContext';

const CONTEXTUAL_PROMPTS = {
  '/dashboard': [
    'What is my portfolio score?',
    'Which policy needs the most attention?',
    'When is my next premium due?',
  ],
  '/documents': [
    'What documents should I keep on file?',
    'How do I read a policy illustration?',
    'What is a declarations page?',
  ],
  '/report': [
    'What does my policy score mean?',
    'Explain the top opportunity on this policy.',
    'When should I consider converting this policy?',
  ],
  '/advisor': [
    'Should I convert my term policy to whole life?',
    'How much life insurance do I need?',
    'What is the difference between term and whole life?',
  ],
  default: [
    'What is my portfolio score?',
    'Should I convert my term policy?',
    'When is my next premium?',
  ],
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MarkdownText = ({ text }) =>
  text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );

// Inner panel — shared between desktop (always visible) and mobile (slide-over)
function SidebarInner({ onClose }) {
  const { sessions, activeSid, setActiveSid, activeSession, newSession, sendMessage, isTyping } = useAIChat();
  const location = useLocation();
  const [input, setInput] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const baseRoute = '/' + (location.pathname.split('/')[1] ?? '');
  const suggestedPrompts = CONTEXTUAL_PROMPTS[baseRoute] ?? CONTEXTUAL_PROMPTS.default;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const submit = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const messages = activeSession?.messages ?? [];

  return (
    <div className="flex flex-col h-full bg-brand-dark">

      {/* Header — matches AppNav height */}
      <div className="h-[60px] flex items-center gap-3 px-4 border-b border-brand-slate-light flex-shrink-0 bg-brand-slate">
        <div className="w-8 h-8 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
          <Bot size={16} className="text-accent-amber" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            {showSessions ? 'Chat History' : (activeSession?.title ?? 'AI Policy Advisor')}
          </p>
          {!showSessions && (
            <span className="flex items-center gap-1 text-green-400 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSessions((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${showSessions ? 'text-accent-amber bg-accent-amber/10' : 'text-text-muted hover:text-white hover:bg-brand-slate-light/40'}`}
            title="Chat history"
          >
            <Clock size={15} />
          </button>
          <button
            onClick={() => { newSession(); setShowSessions(false); setTimeout(() => inputRef.current?.focus(), 100); }}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-brand-slate-light/40 transition-colors"
            title="New chat"
          >
            <Plus size={15} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-brand-slate-light/40 transition-colors lg:hidden"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Sessions list */}
      {showSessions ? (
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveSid(s.id); setShowSessions(false); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-slate/60 transition-colors border-b border-brand-slate-light/40 ${s.id === activeSid ? 'bg-brand-slate/80' : ''}`}
            >
              <MessageSquare size={13} className="text-text-muted mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${s.id === activeSid ? 'text-accent-amber' : 'text-white'}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-text-muted truncate mt-0.5">{s.preview}</p>
              </div>
              <span className="text-[10px] text-text-muted flex-shrink-0 mt-0.5">{fmtDate(s.date)}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-accent-amber text-brand-dark' : 'bg-brand-slate border border-brand-slate-light text-text-secondary'}`}>
                  {msg.role === 'user' ? <User size={11} /> : <Bot size={11} />}
                </div>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20 rounded-tr-none' : 'bg-brand-slate text-text-primary border border-brand-slate-light rounded-tl-none'}`}>
                  <MarkdownText text={msg.content} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-slate border border-brand-slate-light flex items-center justify-center flex-shrink-0">
                  <Bot size={11} className="text-text-secondary" />
                </div>
                <div className="px-3 py-2.5 bg-brand-slate border border-brand-slate-light rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts — only on fresh session */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-col gap-1.5 flex-shrink-0">
              {suggestedPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left px-3 py-2 bg-brand-slate border border-brand-slate-light text-text-secondary hover:text-white hover:border-accent-amber/40 text-xs rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-brand-slate-light flex-shrink-0">
            <div className="flex items-center gap-2 bg-brand-slate border border-brand-slate-light rounded-xl px-3 py-2 focus-within:border-accent-amber/60 transition-colors">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about your policies…"
                className="flex-1 bg-transparent outline-none text-white text-xs placeholder-text-muted"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
              <button
                disabled={!input.trim() || isTyping}
                onClick={submit}
                className="w-7 h-7 rounded-lg bg-accent-amber disabled:bg-brand-slate-light text-brand-dark disabled:text-text-muted flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={12} className="translate-x-[1px]" />
              </button>
            </div>
            <p className="text-center text-[9px] text-text-muted mt-1.5">
              Informational only — not financial or legal advice.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function AIChatSidebar() {
  const { isOpen, toggle } = useAIChat();

  return (
    <>
      {/* Desktop: always visible as fixed right panel */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-[300px] border-l border-brand-slate-light z-30">
        <SidebarInner />
      </div>

      {/* Mobile: slide-over when isOpen */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggle}
          />
          <div className="lg:hidden fixed right-0 top-0 bottom-0 w-full sm:w-[340px] border-l border-brand-slate-light z-50 flex flex-col">
            <SidebarInner onClose={toggle} />
          </div>
        </>
      )}
    </>
  );
}
