import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, User, Send, Plus, MessageSquare, ChevronRight } from 'lucide-react';
import { useAIChat } from '../context/AIChatContext';

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

export default function AIChatSidebar() {
  const { isOpen, toggle, sessions, activeSid, setActiveSid, activeSession, newSession, sendMessage, isTyping } = useAIChat();
  const [input, setInput] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowSessions(false);
    }
  }, [isOpen, activeSid]);

  const submit = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  if (!isOpen) return null;

  const messages = activeSession?.messages ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:bg-transparent"
        onClick={toggle}
      />

      {/* Sidebar panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[480px] bg-brand-dark border-l border-brand-slate-light z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-brand-slate-light flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-accent-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">AI Policy Advisor</p>
            <p className="text-text-muted text-xs truncate">
              {activeSession?.title ?? 'New conversation'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Toggle session list */}
            <button
              onClick={() => setShowSessions((v) => !v)}
              className={`p-2 rounded-lg transition-colors text-sm ${showSessions ? 'bg-accent-amber/10 text-accent-amber' : 'text-text-secondary hover:text-white hover:bg-brand-slate-light/40'}`}
              title="Chat history"
            >
              <MessageSquare size={16} />
            </button>
            {/* New chat */}
            <button
              onClick={() => { newSession(); setShowSessions(false); }}
              className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors"
              title="New chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Session list (collapsible) */}
        {showSessions && (
          <div className="border-b border-brand-slate-light bg-brand-slate flex-shrink-0 max-h-56 overflow-y-auto">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveSid(s.id); setShowSessions(false); }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-navy/60 transition-colors ${s.id === activeSid ? 'bg-brand-navy/80' : ''}`}
              >
                <MessageSquare size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${s.id === activeSid ? 'text-accent-amber' : 'text-white'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{s.preview}</p>
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0 mt-0.5">{fmtDate(s.date)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-accent-amber text-brand-dark'
                  : 'bg-brand-slate border border-brand-slate-light text-text-secondary'
              }`}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20 rounded-tr-none'
                  : 'bg-brand-slate text-text-primary border border-brand-slate-light rounded-tl-none'
              }`}>
                <MarkdownText text={msg.content} />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-slate border border-brand-slate-light flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-text-secondary" />
              </div>
              <div className="px-4 py-3 bg-brand-slate border border-brand-slate-light rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts (only when first message in new session) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
            {['What is my portfolio score?', 'Should I convert my term policy?', 'When is my next premium?'].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 bg-brand-slate border border-brand-slate-light text-text-secondary hover:text-white hover:border-accent-amber/40 text-xs rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-brand-slate-light flex-shrink-0">
          <div className="flex items-center gap-2 bg-brand-slate border border-brand-slate-light rounded-xl p-2 pl-4 focus-within:border-accent-amber/60 transition-colors">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your policies…"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-text-muted"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <button
              disabled={!input.trim() || isTyping}
              onClick={submit}
              className="w-8 h-8 rounded-lg bg-accent-amber disabled:bg-brand-slate-light text-brand-dark disabled:text-text-muted flex items-center justify-center transition-colors"
            >
              <Send size={13} className="translate-x-[1px]" />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-muted mt-2">
            AI responses are informational only — not financial or legal advice.
          </p>
        </div>
      </div>
    </>
  );
}
