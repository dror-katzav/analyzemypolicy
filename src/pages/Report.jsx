import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  MessageCircle,
  Send,
  Mail,
  Zap,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Info,
  X,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { MOCK_POLICIES } from '../data/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString()}`;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// ─── Score Ring ──────────────────────────────────────────────────────────────

const ScoreRing = ({ score, size = 100 }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Good Standing' : score >= 65 ? 'Needs Review' : 'Action Required';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#334155" strokeWidth="8"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2} y={size / 2 - 4}
          textAnchor="middle" fontSize="26"
          fill={color} fontWeight="bold"
        >
          {score}
        </text>
        <text
          x={size / 2} y={size / 2 + 14}
          textAnchor="middle" fontSize="10"
          fill="#64748b"
        >
          OUT OF 100
        </text>
      </svg>
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
        style={{
          background: color + '20',
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Milestone type styles ───────────────────────────────────────────────────

const milestoneStyle = (type, isPast) => {
  if (isPast) return { dot: 'bg-brand-slate-light border-brand-slate-light', text: 'text-text-muted' };
  const map = {
    premium:   { dot: 'bg-accent-amber border-accent-amber', text: 'text-accent-amber' },
    option:    { dot: 'bg-blue-500 border-blue-500', text: 'text-blue-400' },
    review:    { dot: 'bg-green-500 border-green-500', text: 'text-green-400' },
    warning:   { dot: 'bg-orange-500 border-orange-500', text: 'text-orange-400' },
    critical:  { dot: 'bg-red-500 border-red-500', text: 'text-red-400' },
    endowment: { dot: 'bg-purple-500 border-purple-500', text: 'text-purple-400' },
  };
  return map[type] || { dot: 'bg-text-muted border-text-muted', text: 'text-text-muted' };
};

// ─── Mock AI responses ───────────────────────────────────────────────────────

const getMockResponse = (question, policy) => {
  const q = question.toLowerCase();
  if (q.includes('cash value') || q.includes('cv'))
    return `Your **${policy.name}** currently has an estimated cash value of **${fmt(policy.cashValue)}**. Based on your policy illustration, it's projected to reach approximately **$146K by 2030** and **$312K by 2040**. You can access this value through a policy loan (tax-free) or surrender — though surrendering ends your coverage.`;
  if (q.includes('premium') || q.includes('payment'))
    return `Your current premium is **$${policy.premium}/month** (${policy.premiumFrequency}). Your next payment is due **${fmtDate(policy.nextPremiumDate)}**. Compared to similar profiles in our database, your premium is within a normal range for a ${policy.type} policy with this face amount.`;
  if (q.includes('beneficiar'))
    return `Your policy lists **${policy.beneficiary}** as the primary beneficiary. We recommend reviewing this annually — especially after life changes like marriage, divorce, or a new child. Updating a beneficiary is typically free and takes under 10 minutes with your carrier.`;
  if (q.includes('convert') || q.includes('conversion'))
    return `This is an important opportunity. Your policy's conversion window opens **April 2030**. Converting before any health changes allows you to lock in your current health classification — meaning no new medical exam, and permanent coverage that builds cash value. The longer you wait, the more expensive it becomes.`;
  if (q.includes('score') || q.includes('grade'))
    return `Your policy score of **${policy.score}/100** reflects coverage adequacy, premium efficiency, beneficiary status, and milestone alignment. The main item holding your score back is ${policy.opportunities[0]?.title.toLowerCase() || 'a pending review item'}. Addressing that could push your score above 80.`;
  return `That's a great question about your **${policy.name}**. Based on your policy data, here's what I can tell you: your coverage of **${fmt(policy.faceAmount)}** is active and current. The most important action item right now is: *${policy.opportunities[0]?.title || 'reviewing your policy'}*. Would you like me to walk you through the options?`;
};

// ─── Report ──────────────────────────────────────────────────────────────────

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const policy = MOCK_POLICIES.find((p) => p.id === id) || MOCK_POLICIES[0];

  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedOpp, setExpandedOpp] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      content: `Hi! I've reviewed your **${policy.name}** policy. I can answer questions about your coverage, cash value, premiums, milestones, or options. What would you like to know?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', content: getMockResponse(userMsg.content, policy) },
      ]);
      setChatLoading(false);
    }, 1200);
  };

  const severityBadge = (severity) => {
    if (severity === 'high') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (severity === 'medium') return 'bg-amber-500/10 text-accent-amber border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const scoreBreakdown = [
    { label: 'Coverage Adequacy', value: policy.score >= 80 ? 92 : 78, color: '#22c55e' },
    { label: 'Premium Efficiency', value: policy.score >= 80 ? 85 : 72, color: '#f59e0b' },
    { label: 'Beneficiary & Legal', value: policy.score >= 80 ? 70 : 58, color: '#f59e0b' },
    { label: 'Policy Structure', value: policy.score >= 80 ? 88 : 75, color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="report" />

      {/* Policy hero */}
      <div className="bg-brand-slate border-b border-brand-slate-light">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Carrier badge + info */}
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: policy.carrierColor }}
              >
                {policy.carrierInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">{policy.name}</h1>
                  <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                    Active
                  </span>
                </div>
                <p className="text-text-secondary text-sm">
                  {policy.type} · {policy.carrier} · Issued {fmtDate(policy.issueDate)}
                </p>
                <p className="text-text-muted text-xs mt-1">
                  Insured: {policy.insured} · Beneficiary: {policy.beneficiary}
                </p>
              </div>
            </div>

            {/* Score ring */}
            <ScoreRing score={policy.score} size={100} />
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Death Benefit', value: fmt(policy.deathBenefit), icon: <Shield size={16} className="text-blue-400" /> },
              { label: 'Monthly Premium', value: `$${policy.premium}`, icon: <DollarSign size={16} className="text-accent-amber" /> },
              { label: 'Est. Cash Value', value: policy.cashValue > 0 ? fmt(policy.cashValue) : 'N/A', icon: <TrendingUp size={16} className="text-green-400" /> },
              { label: 'Next Payment', value: fmtDate(policy.nextPremiumDate), icon: <Calendar size={16} className="text-text-secondary" /> },
            ].map((m) => (
              <div key={m.label} className="bg-brand-navy rounded-xl p-4 border border-brand-slate-light">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-2">
                  {m.icon} {m.label}
                </div>
                <p className="text-white font-bold text-lg">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-slate-light sticky top-[64px] bg-brand-dark z-30">
        <div className="max-w-5xl mx-auto px-6 md:px-8 flex gap-0">
          {[
            { key: 'analysis', label: 'Analysis', icon: <Shield size={15} /> },
            { key: 'chat', label: 'Ask AI', icon: <MessageCircle size={15} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-accent-amber text-accent-amber'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-8 py-8 pb-32">

        {/* ── ANALYSIS TAB ── */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">

            {/* Summary */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <Info size={18} className="text-text-muted" /> Policy Summary
              </h2>
              <p className="text-text-secondary leading-relaxed">{policy.summary}</p>
            </div>

            {/* Score breakdown */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
              <h2 className="text-white font-bold mb-5 flex items-center gap-2">
                <Shield size={18} className="text-text-muted" /> Score Breakdown
              </h2>
              <div className="space-y-4">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-bold text-white">{item.value}/100</span>
                    </div>
                    <div className="h-2 bg-brand-navy rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {policy.strengths.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">
                    Strengths
                  </p>
                  <ul className="space-y-2">
                    {policy.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Opportunities */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
              <h2 className="text-white font-bold mb-5 flex items-center gap-2">
                <Zap size={18} className="text-text-muted" /> Opportunities to Improve
              </h2>
              <div className="space-y-3">
                {policy.opportunities.map((opp) => {
                  const isOpen = expandedOpp === opp.id;
                  return (
                    <div
                      key={opp.id}
                      className="border border-brand-slate-light rounded-xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-navy/50 transition-colors"
                        onClick={() => setExpandedOpp(isOpen ? null : opp.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityBadge(opp.severity)}`}
                          >
                            {opp.severity}
                          </span>
                          <span className="text-white font-semibold text-sm">{opp.title}</span>
                        </div>
                        {isOpen ? (
                          <ChevronUp size={16} className="text-text-muted flex-shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-text-muted flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-brand-slate-light bg-brand-navy/30">
                          <p className="text-text-secondary text-sm mt-4 leading-relaxed">
                            {opp.description}
                          </p>
                          <button
                            className="mt-4 px-5 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-sm font-bold rounded-lg transition-colors"
                            onClick={() => setShowEmailModal(true)}
                          >
                            {opp.cta}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones timeline */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
              <h2 className="text-white font-bold mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-text-muted" /> Policy Timeline
              </h2>
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-4 top-3 bottom-3 w-[2px] bg-brand-slate-light" />

                <div className="space-y-6">
                  {policy.milestones.map((ms) => {
                    const s = milestoneStyle(ms.type, ms.isPast);
                    return (
                      <div key={ms.id} className="relative flex items-start gap-5">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[3px] w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${s.dot} ${ms.isPast ? 'opacity-40' : ''}`}
                        />
                        <div className="pl-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold ${
                                ms.isPast ? 'text-text-muted' : 'text-white'
                              }`}
                            >
                              {ms.label}
                            </span>
                            {ms.isUrgent && !ms.isPast && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-text-muted text-xs mt-0.5">{fmtDate(ms.date)}</p>
                          <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                            {ms.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <div className="flex flex-col">
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-amber/20 flex items-center justify-center">
                <Bot size={18} className="text-accent-amber" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AI Policy Advisor</p>
                <p className="text-text-muted text-xs">
                  Ask me anything about your {policy.shortName} policy
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-green-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </span>
            </div>

            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                'What is my cash value?',
                'When is my next premium?',
                'Should I convert this policy?',
                'How can I improve my score?',
              ].map((q) => (
                <button
                  key={q}
                  className="px-3 py-1.5 bg-brand-slate border border-brand-slate-light text-text-secondary hover:text-white hover:border-accent-amber/40 text-xs rounded-full transition-colors"
                  onClick={() => {
                    setChatInput(q);
                    setTimeout(() => {
                      const fakeEvent = { key: 'Enter' };
                      setChatInput('');
                      const userMsg = { role: 'user', content: q };
                      setChatMessages((prev) => [...prev, userMsg]);
                      setChatLoading(true);
                      setTimeout(() => {
                        setChatMessages((prev) => [
                          ...prev,
                          { role: 'model', content: getMockResponse(q, policy) },
                        ]);
                        setChatLoading(false);
                      }, 1200);
                    }, 10);
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat messages */}
            <div className="overflow-y-auto space-y-4 pr-1 chat-scroll" style={{ minHeight: '300px', maxHeight: '480px' }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-accent-amber text-brand-dark'
                        : 'bg-brand-slate border border-brand-slate-light text-text-secondary'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20 rounded-tr-none'
                        : 'bg-brand-slate text-text-primary border border-brand-slate-light rounded-tl-none'
                    }`}
                  >
                    {/* Render basic markdown bold */}
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**') ? (
                        <strong key={j} className="text-white font-bold">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-slate border border-brand-slate-light flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-text-secondary" />
                  </div>
                  <div className="p-4 bg-brand-slate border border-brand-slate-light rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat input */}
            <div className="mt-4 flex items-center gap-2 bg-brand-slate border border-brand-slate-light rounded-xl p-2 pl-4 focus-within:border-accent-amber/60 transition-colors">
              <input
                type="text"
                placeholder={`Ask about your ${policy.shortName} policy…`}
                className="flex-1 bg-transparent outline-none text-white text-sm"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              />
              <button
                disabled={!chatInput.trim() || chatLoading}
                onClick={handleChatSend}
                className="w-9 h-9 rounded-lg bg-accent-amber disabled:bg-brand-slate-light text-brand-dark disabled:text-text-muted flex items-center justify-center transition-colors"
              >
                <Send size={15} className="translate-x-[1px]" />
              </button>
            </div>
            <p className="text-center text-[10px] text-text-muted mt-2">
              AI responses are informational only — not financial or legal advice.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-slate border-t border-brand-slate-light z-40">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-text-secondary text-sm hidden md:block flex-1">
            Ready to take action on your {policy.shortName}?
          </p>
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-dark border border-brand-slate-light hover:border-accent-amber/40 text-white font-semibold rounded-lg text-sm transition-colors"
            onClick={() => setShowEmailModal(true)}
          >
            <Mail size={16} /> Send Report to Advisor
          </button>
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
            onClick={() => setShowEmailModal(true)}
          >
            <Zap size={16} /> Let AnalyzeMyPolicy Handle It
          </button>
        </div>
      </div>

      {/* ── Email/Action Modal ── */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-brand-dark rounded-2xl w-full max-w-md relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-brand-dark"
              onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
            >
              <X size={22} />
            </button>

            {!emailSent ? (
              <div className="p-8">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
                  <Mail size={22} className="text-accent-amber-hover" />
                </div>
                <h3 className="text-xl font-bold mb-1">Send Report to Your Advisor</h3>
                <p className="text-slate-500 text-sm mb-6">
                  We'll email a full analysis of your <strong>{policy.name}</strong> with
                  recommendations directly to your advisor.
                </p>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                      Your Name
                    </label>
                    <input
                      type="text"
                      defaultValue="James Harrison"
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                      Advisor Email
                    </label>
                    <input
                      type="email"
                      placeholder="advisor@example.com"
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                      Note (optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="I'd like to discuss the conversion option…"
                      className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-accent-amber transition-colors text-sm resize-none"
                    />
                  </div>
                </div>

                <button
                  className="w-full py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
                  onClick={() => setEmailSent(true)}
                >
                  Send Report
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Report Sent!</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Your advisor will receive a complete analysis of your {policy.name} with
                  personalized recommendations.
                </p>
                <button
                  className="px-6 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
                  onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
