import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, DollarSign, Calendar, CheckCircle, Clock,
  TrendingUp, Mail, Zap, ChevronDown,
  ChevronUp, Bot, Info, X, AlertTriangle, Sparkles,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useAIChat } from '../context/AIChatContext';
import { usePolicies } from '../context/PoliciesContext';
import { fmt, fmtDate, milestoneStyle } from '../utils/formatters';
import ScoreRing from '../components/ScoreRing';
import AgentModal from '../components/AgentModal';
import SendReportModal from '../components/SendReportModal';



// ─── Report ──────────────────────────────────────────────────────────────────

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open: openChat } = useAIChat();
  const { policies } = usePolicies();
  const policy = policies.find((p) => p.id === id) || policies[0];

  const [expandedOpp, setExpandedOpp] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);

  useEffect(() => {
    if (policy?.name) document.title = `${policy.name} — AnalyzeMyPolicy`;
  }, [policy?.name]);

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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-accent-amber transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate('/dashboard')} className="hover:text-accent-amber transition-colors">Your Policies</button>
            <span>/</span>
            <span className="text-text-secondary font-medium truncate max-w-[180px]">{policy.name}</span>
          </nav>
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

      {/* Tab bar — Analysis only, with Ask AI shortcut on right */}
      <div className="border-b border-brand-slate-light sticky top-[60px] bg-brand-dark z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center">
          <span className="flex items-center gap-2 px-4 md:px-5 py-3.5 md:py-4 text-sm font-semibold border-b-2 border-accent-amber text-accent-amber">
            <Shield size={14} /> Analysis
          </span>
          <button
            onClick={openChat}
            className="ml-auto flex items-center gap-1.5 px-3 py-3.5 text-xs text-text-secondary hover:text-accent-amber transition-colors font-medium lg:hidden"
          >
            <Bot size={14} /> Ask AI
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 pb-28 md:pb-32">
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
      </div>

      {/* ── Sticky CTA bar ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:right-[300px] bg-brand-slate border-t border-brand-slate-light z-40">
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
