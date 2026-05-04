import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle,
  Info,
  X,
  Zap,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { usePolicies } from '../context/PoliciesContext';
import { PORTFOLIO_SUMMARY } from '../data/mockData';
import { fmt, urgencyBadge, urgencyIcon } from '../utils/formatters';
import ScoreRing from '../components/ScoreRing';
import CashValueChart from '../components/CashValueChart';
import PremiumModal from '../components/PremiumModal';
import PortfolioScoreModal from '../components/PortfolioScoreModal';



// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    policies,
    portfolioScore,
    totalCoverage,
    totalMonthlyPremium,
    estimatedCashValue,
    upcomingEvents,
    nextPremium,
    cashValueHistory,
  } = usePolicies();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const cashValuePolicies = policies.filter((p) => p.cashValueSeries?.length > 0);
  const [chartPolicyId, setChartPolicyId] = useState(() => cashValuePolicies[0]?.id ?? null);
  const selectedChartPolicy = cashValuePolicies.find((p) => p.id === chartPolicyId) ?? cashValuePolicies[0];
  const chartData = selectedChartPolicy?.cashValueSeries ?? cashValueHistory;

  const firstName = user?.firstName ?? 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysAway = (iso) => {
    const d = new Date(iso); d.setHours(0, 0, 0, 0);
    return Math.round((d - today) / 86400000);
  };
  const nextDueLabel = (() => {
    if (!nextPremium) return 'No upcoming';
    const d = new Date(nextPremium.date);
    const days = daysAway(nextPremium.date);
    if (days <= 0) return 'Due today';
    return `Next due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  })();

  const highOpps = policies.flatMap((p) => p.opportunities.filter((o) => o.severity === 'high'));
  const medOpps = policies.flatMap((p) => p.opportunities.filter((o) => o.severity === 'medium'));
  const subtitleMsg = (() => {
    if (policies.length === 0) return 'Add your first policy to get started.';
    if (highOpps.length > 0) return `${highOpps.length} high-priority action item${highOpps.length > 1 ? 's' : ''} need${highOpps.length === 1 ? 's' : ''} your attention.`;
    if (medOpps.length > 0) return `${medOpps.length} improvement opportunity${medOpps.length > 1 ? 's' : ''} identified across your policies.`;
    return 'Your portfolio is in great shape — no critical items.';
  })();

  const cashValueGrowthPct = (() => {
    const actual = cashValueHistory.filter((d) => d.actual !== undefined);
    if (actual.length < 2) return null;
    const prev = actual[actual.length - 2].actual;
    const curr = actual[actual.length - 1].actual;
    const pct = ((curr - prev) / prev) * 100;
    return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '% this year';
  })();

  const kpiCards = [
    {
      label: 'Total Coverage',
      value: fmt(totalCoverage),
      sub: `${policies.length} active polic${policies.length === 1 ? 'y' : 'ies'}`,
      icon: <Shield size={20} className="text-blue-400" />,
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Est. Cash Value',
      value: fmt(estimatedCashValue),
      sub: cashValueGrowthPct ?? '—',
      icon: <TrendingUp size={20} className="text-green-400" />,
      iconBg: 'bg-green-500/10',
    },
    {
      label: 'Monthly Premium',
      value: `$${totalMonthlyPremium.toLocaleString()}`,
      sub: nextDueLabel,
      subAlert: nextPremium && daysAway(nextPremium.date) <= 3,
      icon: <DollarSign size={20} className="text-accent-amber" />,
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Portfolio Score',
      value: portfolioScore,
      isScore: true,
      sub: (() => {
        const n = highOpps.length + medOpps.length;
        return n === 0 ? 'No action items — great shape' : `${n} item${n > 1 ? 's' : ''} need${n === 1 ? 's' : ''} attention`;
      })(),
      clickable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="dashboard" />

      {/* Page header */}
      <div className="px-4 md:px-8 py-6 md:py-8 border-b border-brand-slate-light">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {greeting}, {firstName}
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          {subtitleMsg}
        </p>
      </div>

      <div className="flex-1 px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              onClick={card.clickable ? () => setShowScoreModal(true) : undefined}
              className={`bg-brand-slate border border-brand-slate-light rounded-xl p-4 md:p-5 ${
                card.clickable ? 'cursor-pointer hover:border-accent-amber/40 transition-colors group' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <span className="text-[10px] md:text-xs text-text-muted font-semibold uppercase tracking-wider">
                  {card.label}
                </span>
                {card.icon && (
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                )}
                {card.clickable && (
                  <Zap size={14} className="text-text-muted group-hover:text-accent-amber transition-colors" />
                )}
              </div>
              {card.isScore ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <ScoreRing score={card.value} size={48} />
                  <div>
                    <p className="text-white font-bold text-xl md:text-2xl leading-none">{card.value}</p>
                    <p className="text-text-muted text-xs mt-0.5">/100</p>
                  </div>
                </div>
              ) : (
                <p className="text-white font-bold text-xl md:text-2xl leading-tight">{card.value}</p>
              )}
              <p className={`text-xs mt-2 ${card.clickable ? 'text-accent-amber group-hover:underline' : card.subAlert ? 'text-red-400 font-semibold' : 'text-text-muted'}`}>
                {card.sub}
              </p>
              {card.subAlert && (
                <a
                  href={`/report/${nextPremium?.policyName}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPremiumModal(true); }}
                  className="text-[10px] text-accent-amber hover:underline mt-0.5 block"
                >
                  View payment info →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Chart + Events */}
        {policies.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-brand-slate border border-brand-slate-light rounded-xl p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
              <div>
                <h2 className="text-white font-bold text-sm md:text-base">Cash Value Growth</h2>
                <p className="text-text-muted text-xs mt-0.5">Historical &amp; projected</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-text-muted flex-shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-[2px] bg-accent-amber inline-block" />Actual
                </span>
                <span className="flex items-center gap-1.5 opacity-60">
                  <span className="w-5 h-[2px] border-b-2 border-dashed border-accent-amber inline-block" />Projected
                </span>
              </div>
            </div>
            {cashValuePolicies.length > 1 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {cashValuePolicies.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setChartPolicyId(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      chartPolicyId === p.id
                        ? 'border-accent-amber bg-accent-amber/10 text-accent-amber'
                        : 'border-brand-slate-light text-text-secondary hover:border-accent-amber/40'
                    }`}
                  >
                    {p.shortName}
                  </button>
                ))}
              </div>
            )}
            <CashValueChart data={chartData} />
            {selectedChartPolicy && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => navigate(`/report/${selectedChartPolicy.id}`)}
                  className="flex items-center gap-1 text-xs text-accent-amber hover:underline font-semibold"
                >
                  View full projection <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-5">
              <h2 className="text-white font-bold text-sm md:text-base">Upcoming Events</h2>
              <Calendar size={16} className="text-text-muted" />
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle size={24} className="text-green-400 mb-2" />
                <p className="text-text-secondary text-sm font-medium">No upcoming events</p>
                <p className="text-text-muted text-xs mt-1">You're all caught up.</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {upcomingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg border border-brand-slate-light hover:border-accent-amber/40 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/report/${ev.policyId}`)}
                  >
                    <div className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${urgencyBadge(ev.urgency)}`}>
                      {daysAway(ev.date) <= 0 ? 'TODAY' : `${daysAway(ev.date)}d`}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-white font-medium leading-snug group-hover:text-accent-amber transition-colors">
                        {ev.label}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{ev.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>}

        {/* Policy Cards */}
        <div>
          <h2 className="text-white font-bold mb-3 md:mb-4 text-sm md:text-base">Your Policies</h2>
          {policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-brand-slate border border-dashed border-brand-slate-light rounded-xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-amber/10 flex items-center justify-center mb-4">
                <Shield size={26} className="text-accent-amber" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">No policies yet</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm">
                Upload a policy document or illustration to get a full AI-powered analysis and monitoring.
              </p>
              <button
                onClick={() => navigate('/analyze')}
                className="px-6 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
              >
                + Analyze Your First Policy
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {policies.map((policy) => {
              const scoreColor = policy.score >= 80 ? 'text-green-400' : policy.score >= 65 ? 'text-accent-amber' : 'text-red-400';
              const urgentMilestone = policy.milestones.find((m) => m.isUrgent);
              return (
                <div
                  key={policy.id}
                  className="bg-brand-slate border border-brand-slate-light rounded-xl p-4 md:p-6 hover:border-accent-amber/40 cursor-pointer transition-all group"
                  onClick={() => navigate(`/report/${policy.id}`)}
                >
                  <div className="flex items-start justify-between mb-4 md:mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: policy.carrierColor }}
                      >
                        {policy.carrierInitials}
                      </div>
                      <div>
                        <h3 className="text-white font-bold leading-tight group-hover:text-accent-amber transition-colors text-sm md:text-base">
                          {policy.name}
                        </h3>
                        <p className="text-text-muted text-xs mt-0.5">{policy.type} · {policy.carrier}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <ScoreRing score={policy.score} size={40} />
                      <span className={`text-[10px] font-bold ${scoreColor}`}>{policy.scoreLabel}</span>
                      {policy.score < 80 && policy.opportunities[0] && (
                        <span className="text-[9px] text-text-muted max-w-[90px] leading-tight">{policy.opportunities[0].title}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
                    {[['Coverage', fmt(policy.faceAmount)], ['Premium', `$${policy.premium}/mo`], ['Cash Value', policy.cashValue > 0 ? fmt(policy.cashValue) : policy.type === 'Term Life' ? 'N/A' : '—']].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-1">{label}</p>
                        <p className={`font-bold text-sm ${val === 'N/A' ? 'text-text-muted' : 'text-white'}`}>{val}</p>
                        {label === 'Cash Value' && val === 'N/A' && (
                          <p className="text-[9px] text-text-muted leading-tight mt-0.5">Term policies don't build cash value</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {urgentMilestone && (
                    <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs mb-4">
                      {urgencyIcon('high')}
                      <span className="text-accent-amber font-medium">{urgentMilestone.label}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {policy.opportunities.length} {policy.opportunities.length === 1 ? 'opportunity' : 'opportunities'} identified
                    </span>
                    <span className="flex items-center gap-1 text-xs text-accent-amber font-semibold group-hover:translate-x-0.5 transition-transform">
                      View analysis <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* CTA banner */}
        <div className="bg-gradient-to-r from-brand-slate to-brand-navy border border-brand-slate-light rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-base md:text-lg">Add Another Policy</h3>
            <p className="text-text-secondary text-sm mt-1">
              Upload a policy document, illustration, or statement to get a full analysis.
            </p>
          </div>
          <button
            className="flex-shrink-0 px-5 py-2.5 md:px-6 md:py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
            onClick={() => navigate('/analyze')}
          >
            + Analyze a Policy
          </button>
        </div>

      </div>

      <footer className="px-4 md:px-8 py-5 md:py-6 border-t border-brand-slate-light text-center text-xs text-text-muted">
        🔒 AES-256 encryption · TLS 1.3 in transit ·{' '}
        <a href="/security" className="text-accent-amber hover:underline">SOC 2 Type II certified</a>
        {' '}· Your data is never sold or shared
      </footer>

      {/* Portfolio Score Modal */}
      {showScoreModal && (
        <PortfolioScoreModal
          score={portfolioScore}
          policies={policies}
          onClose={() => setShowScoreModal(false)}
          onViewPolicy={(id) => navigate(`/report/${id}`)}
        />
      )}

      {/* Premium Payment Modal */}
      {showPremiumModal && (
        <PremiumModal
          nextPremium={nextPremium}
          policies={policies}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
