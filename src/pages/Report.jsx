import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, DollarSign, Calendar, CheckCircle, Clock,
  TrendingUp, MessageCircle, Send, Mail, Zap, ChevronDown,
  ChevronUp, Bot, User, Info, X, AlertTriangle, Sparkles,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useAIChat } from '../context/AIChatContext';
import { MOCK_POLICIES } from '../data/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K`
  : `$${n.toLocaleString()}`;

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#334155" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="26" fill={color} fontWeight="bold">{score}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="10" fill="#64748b">OUT OF 100</text>
      </svg>
      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: color + '20', color }}>
        {label}
      </span>
    </div>
  );
};

// ─── Milestone styles ────────────────────────────────────────────────────────

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

// ─── Agentic Task Modal ──────────────────────────────────────────────────────

const AGENT_TASKS = (policy) => [
  { id: 1, label: 'Reviewing policy documents and coverage details', duration: 1000 },
  { id: 2, label: `Analyzing ${policy.carrier} carrier options and rates`, duration: 1400 },
  { id: 3, label: 'Identifying highest-impact action items', duration: 1200 },
  { id: 4, label: 'Drafting beneficiary update instructions', duration: 1600 },
  { id: 5, label: 'Preparing conversion timeline and comparison', duration: 1300 },
  { id: 6, label: 'Scheduling advisor consultation', duration: 900 },
];

const AgentModal = ({ policy, onClose }) => {
  const [taskStates, setTaskStates] = useState(() =>
    AGENT_TASKS(policy).map((t) => ({ ...t, status: 'pending' }))
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    let delay = 600;
    const tasks = AGENT_TASKS(policy);
    tasks.forEach((task, i) => {
      setTimeout(() => {
        setTaskStates((prev) => prev.map((t) => t.id === task.id ? { ...t, status: 'running' } : t));
        setTimeout(() => {
          setTaskStates((prev) => prev.map((t) => t.id === task.id ? { ...t, status: 'done' } : t));
          if (i === tasks.length - 1) setTimeout(() => setDone(true), 400);
        }, task.duration);
      }, delay);
      delay += task.duration + 200;
    });
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === 'done') return <CheckCircle size={15} className="text-green-400 flex-shrink-0" />;
    if (status === 'running') return <Clock size={15} className="text-accent-amber animate-spin flex-shrink-0" />;
    return <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-slate-light flex-shrink-0" />;
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative shadow-2xl">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        {!done ? (
          <div className="p-6 md:p-8">
            <div className="w-12 h-12 bg-accent-amber/10 border border-accent-amber/20 rounded-2xl flex items-center justify-center mb-5">
              <Sparkles size={22} className="text-accent-amber" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">AnalyzeMyPolicy Agent</h3>
            <p className="text-text-secondary text-sm mb-6">
              Taking action on your <strong className="text-white">{policy.name}</strong> policy…
            </p>

            <div className="space-y-3">
              {taskStates.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    task.status === 'running'
                      ? 'border-accent-amber/40 bg-accent-amber/5'
                      : task.status === 'done'
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-brand-slate-light bg-brand-navy/30'
                  }`}
                >
                  <StatusIcon status={task.status} />
                  <span className={`text-sm ${
                    task.status === 'done' ? 'text-text-secondary line-through'
                    : task.status === 'running' ? 'text-white font-medium'
                    : 'text-text-muted'
                  }`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              Agent working autonomously…
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">All Done!</h3>
            <p className="text-text-secondary text-sm mb-6">
              Your action plan is ready. We've prepared beneficiary update forms, a conversion timeline, and scheduled a call with your advisor for <strong className="text-white">Thursday, May 7 at 2:00 PM</strong>.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['6', 'Actions taken'], ['1', 'Advisor scheduled'], ['3', 'Docs prepared']].map(([v, l]) => (
                <div key={l} className="bg-brand-navy rounded-xl p-3 border border-brand-slate-light">
                  <p className="text-accent-amber font-bold text-xl">{v}</p>
                  <p className="text-text-muted text-[11px] mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <button
              className="w-full py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
              onClick={onClose}
            >
              View My Action Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Send Report Modal ───────────────────────────────────────────────────────

const SendReportModal = ({ policy, user, onClose }) => {
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Policy Holder';

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md relative shadow-2xl">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" onClick={onClose}>
          <X size={20} />
        </button>

        {!sent ? (
          <div className="p-6 md:p-8">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
              <Mail size={22} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-1">Send Report to Advisor</h3>
            <p className="text-slate-500 text-sm mb-6">
              We'll send a full analysis of your <strong>{policy.name}</strong> with recommendations directly to your advisor.
            </p>

            <div className="space-y-3 mb-6">
              {/* Read-only sender info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Advisor Email *
                </label>
                <input
                  type="email"
                  placeholder="advisor@example.com"
                  value={advisorEmail}
                  onChange={(e) => setAdvisorEmail(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="I'd like to discuss the conversion option…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <button
              disabled={!advisorEmail}
              className="w-full py-3 px-6 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setSent(true)}
            >
              Send Report
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Report Sent!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Your advisor will receive a complete analysis of your {policy.name} with personalized recommendations.
            </p>
            <button
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg text-sm transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Report ──────────────────────────────────────────────────────────────────

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open: openChat } = useAIChat();
  const policy = MOCK_POLICIES.find((p) => p.id === id) || MOCK_POLICIES[0];

  const [activeTab, setActiveTab] = useState('analysis');
  const [expandedOpp, setExpandedOpp] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', content: `Hi! I've reviewed your **${policy.name}** policy. I can answer questions about your coverage, cash value, premiums, milestones, or options. What would you like to know?` },
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
      setChatMessages((prev) => [...prev, { role: 'model', content: getMockResponse(userMsg.content, policy) }]);
      setChatLoading(false);
    }, 1200);
  };

  const sendQuestion = (q) => {
    const userMsg = { role: 'user', content: q };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: 'model', content: getMockResponse(q, policy) }]);
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
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white text-base md:text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: policy.carrierColor }}
              >
                {policy.carrierInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-lg md:text-xl font-bold text-white">{policy.name}</h1>
                  <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                    Active
                  </span>
                </div>
                <p className="text-text-secondary text-sm">{policy.type} · {policy.carrier} · Issued {fmtDate(policy.issueDate)}</p>
                <p className="text-text-muted text-xs mt-1">Insured: {policy.insured} · Beneficiary: {policy.beneficiary}</p>
              </div>
            </div>
            <ScoreRing score={policy.score} size={90} />
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            {[
              { label: 'Death Benefit', value: fmt(policy.deathBenefit), icon: <Shield size={15} className="text-blue-400" /> },
              { label: 'Monthly Premium', value: `$${policy.premium}`, icon: <DollarSign size={15} className="text-accent-amber" /> },
              { label: 'Est. Cash Value', value: policy.cashValue > 0 ? fmt(policy.cashValue) : 'N/A', icon: <TrendingUp size={15} className="text-green-400" /> },
              { label: 'Next Payment', value: fmtDate(policy.nextPremiumDate), icon: <Calendar size={15} className="text-text-secondary" /> },
            ].map((m) => (
              <div key={m.label} className="bg-brand-navy rounded-xl p-3 md:p-4 border border-brand-slate-light">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-2">
                  {m.icon} {m.label}
                </div>
                <p className="text-white font-bold text-base md:text-lg">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-slate-light sticky top-[60px] bg-brand-dark z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex gap-0">
          {[
            { key: 'analysis', label: 'Analysis', icon: <Shield size={14} /> },
            { key: 'chat', label: 'Ask AI', icon: <MessageCircle size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 md:px-5 py-3.5 md:py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-accent-amber text-accent-amber'
                  : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          {/* Global AI chat shortcut */}
          <button
            onClick={openChat}
            className="ml-auto flex items-center gap-1.5 px-3 py-3.5 text-xs text-text-secondary hover:text-accent-amber transition-colors font-medium"
          >
            <Bot size={14} /> All Policies
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-32">

        {/* ── ANALYSIS TAB ── */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 md:space-y-8">

            {/* Summary */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
                <Info size={17} className="text-text-muted" /> Policy Summary
              </h2>
              <p className="text-text-secondary leading-relaxed text-sm">{policy.summary}</p>
            </div>

            {/* Score breakdown */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
              <h2 className="text-white font-bold mb-4 md:mb-5 flex items-center gap-2 text-sm md:text-base">
                <Shield size={17} className="text-text-muted" /> Score Breakdown
              </h2>
              <div className="space-y-4">
                {scoreBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-bold text-white">{item.value}/100</span>
                    </div>
                    <div className="h-2 bg-brand-navy rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
              {policy.strengths.length > 0 && (
                <div className="mt-5 md:mt-6">
                  <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">Strengths</p>
                  <ul className="space-y-2">
                    {policy.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Opportunities */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
              <h2 className="text-white font-bold mb-4 md:mb-5 flex items-center gap-2 text-sm md:text-base">
                <Zap size={17} className="text-text-muted" /> Opportunities to Improve
              </h2>
              <div className="space-y-3">
                {policy.opportunities.map((opp) => {
                  const isOpen = expandedOpp === opp.id;
                  return (
                    <div key={opp.id} className="border border-brand-slate-light rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-navy/50 transition-colors"
                        onClick={() => setExpandedOpp(isOpen ? null : opp.id)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityBadge(opp.severity)}`}>
                            {opp.severity}
                          </span>
                          <span className="text-white font-semibold text-sm">{opp.title}</span>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-text-muted flex-shrink-0" /> : <ChevronDown size={16} className="text-text-muted flex-shrink-0" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-5 border-t border-brand-slate-light bg-brand-navy/30">
                          <p className="text-text-secondary text-sm mt-4 leading-relaxed">{opp.description}</p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <button
                              className="flex items-center gap-1.5 px-4 py-2 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-xs font-bold rounded-lg transition-colors"
                              onClick={() => setShowAgentModal(true)}
                            >
                              <Sparkles size={13} /> Let AMP Handle It
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-brand-slate-light hover:border-accent-amber/40 text-text-secondary hover:text-white text-xs font-semibold rounded-lg transition-colors"
                              onClick={() => setShowEmailModal(true)}
                            >
                              <Mail size={13} /> Send to Advisor
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
              <h2 className="text-white font-bold mb-5 md:mb-6 flex items-center gap-2 text-sm md:text-base">
                <Calendar size={17} className="text-text-muted" /> Policy Timeline
              </h2>
              <div className="relative pl-4">
                <div className="absolute left-4 top-3 bottom-3 w-[2px] bg-brand-slate-light" />
                <div className="space-y-5 md:space-y-6">
                  {policy.milestones.map((ms) => {
                    const s = milestoneStyle(ms.type, ms.isPast);
                    return (
                      <div key={ms.id} className="relative flex items-start gap-5">
                        <div className={`absolute -left-[3px] w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${s.dot} ${ms.isPast ? 'opacity-40' : ''}`} />
                        <div className="pl-6">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-bold ${ms.isPast ? 'text-text-muted' : 'text-white'}`}>{ms.label}</span>
                            {ms.isUrgent && !ms.isPast && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase">Urgent</span>
                            )}
                          </div>
                          <p className="text-text-muted text-xs mt-0.5">{fmtDate(ms.date)}</p>
                          <p className="text-text-secondary text-sm mt-1 leading-relaxed">{ms.detail}</p>
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
              <div className="w-9 h-9 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-accent-amber" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">AI Policy Advisor</p>
                <p className="text-text-muted text-xs">Ask me anything about your {policy.shortName} policy</p>
              </div>
              <span className="flex items-center gap-1 text-green-400 text-xs flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>Online
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['What is my cash value?', 'When is my next premium?', 'Should I convert this policy?', 'How can I improve my score?'].map((q) => (
                <button
                  key={q}
                  className="px-3 py-1.5 bg-brand-slate border border-brand-slate-light text-text-secondary hover:text-white hover:border-accent-amber/40 text-xs rounded-full transition-colors"
                  onClick={() => { setActiveTab('chat'); sendQuestion(q); }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto space-y-4 pr-1" style={{ minHeight: '300px', maxHeight: '480px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-accent-amber text-brand-dark' : 'bg-brand-slate border border-brand-slate-light text-text-secondary'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent-amber/15 text-accent-amber border border-accent-amber/20 rounded-tr-none' : 'bg-brand-slate text-text-primary border border-brand-slate-light rounded-tl-none'}`}>
                    {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>
                        : <span key={j}>{part}</span>
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
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <button
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-brand-dark border border-brand-slate-light hover:border-accent-amber/40 text-white font-semibold rounded-lg text-sm transition-colors"
            onClick={() => setShowEmailModal(true)}
          >
            <Mail size={15} /> Send Report to Advisor
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
            onClick={() => setShowAgentModal(true)}
          >
            <Sparkles size={15} /> Let AnalyzeMyPolicy Handle It
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <SendReportModal policy={policy} user={user} onClose={() => setShowEmailModal(false)} />
      )}
      {showAgentModal && (
        <AgentModal policy={policy} onClose={() => setShowAgentModal(false)} />
      )}
    </div>
  );
};

export default Report;
