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

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

const fmtFull = (n) => '$' + n.toLocaleString('en-US');

// ─── SVG Cash Value Chart ────────────────────────────────────────────────────

const CashValueChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);

  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 24, bottom: 36, left: 56 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const allValues = data.map((d) => d.actual ?? d.projected ?? 0).filter(Boolean);
  const maxVal = Math.max(...allValues) * 1.1;
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;

  const xp = (year) => ((year - minYear) / (maxYear - minYear)) * cw;
  const yp = (val) => ch - (val / maxVal) * ch;

  const actualPts = data
    .filter((d) => d.actual !== undefined)
    .map((d) => ({ x: xp(d.year), y: yp(d.actual), ...d }));

  const projectedPts = data
    .filter((d) => d.projected !== undefined || (d.actual !== undefined && d.year === 2026))
    .map((d) => ({ x: xp(d.year), y: yp(d.projected ?? d.actual), ...d }));

  const toPolyline = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');
  const toArea = (pts) => {
    if (!pts.length) return '';
    const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
    return `${pts[0].x},${ch} ${line} ${pts[pts.length - 1].x},${ch}`;
  };

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
  const xTicks = [2015, 2020, 2026, 2030, 2035, 2040];
  const currentX = xp(2026);

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }} onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={0} y1={yp(v)} x2={cw} y2={yp(v)} stroke="#334155" strokeWidth="1" />
              <text x={-8} y={yp(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {v === 0 ? '$0' : fmt(v)}
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text key={yr} x={xp(yr)} y={ch + 20} textAnchor="middle" fontSize="10" fill={yr === 2026 ? '#f59e0b' : '#64748b'} fontWeight={yr === 2026 ? 'bold' : 'normal'}>
              {yr}
            </text>
          ))}
          <line x1={currentX} y1={0} x2={currentX} y2={ch} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          <text x={currentX + 4} y={10} fontSize="9" fill="#f59e0b" opacity="0.8">Today</text>
          {projectedPts.length > 1 && <polygon points={toArea(projectedPts)} fill="url(#projGrad)" />}
          {actualPts.length > 1 && <polygon points={toArea(actualPts)} fill="url(#actualGrad)" />}
          {projectedPts.length > 1 && (
            <polyline points={toPolyline(projectedPts)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
          )}
          {actualPts.length > 1 && (
            <polyline points={toPolyline(actualPts)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          )}
          {[...actualPts, ...projectedPts.slice(1)].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4"
              fill={pt.actual !== undefined ? '#f59e0b' : '#1e293b'}
              stroke="#f59e0b" strokeWidth="2" className="cursor-pointer"
              onMouseEnter={() => setTooltip({ x: pt.x, y: pt.y, year: pt.year, value: pt.actual ?? pt.projected, isProjected: pt.projected !== undefined && pt.actual === undefined })}
            />
          ))}
          {tooltip && (
            <g transform={`translate(${Math.min(tooltip.x, cw - 80)},${Math.max(tooltip.y - 48, 0)})`}>
              <rect x={0} y={0} width={90} height={38} rx={6} fill="#1e293b" stroke="#334155" />
              <text x={8} y={14} fontSize="10" fill="#94a3b8">{tooltip.year} {tooltip.isProjected ? '(proj.)' : ''}</text>
              <text x={8} y={29} fontSize="13" fill="#f59e0b" fontWeight="bold">{fmtFull(tooltip.value)}</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

// ─── Score Ring ──────────────────────────────────────────────────────────────

const ScoreRing = ({ score, size = 52 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#334155" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="13" fill={color} fontWeight="bold">
        {score}
      </text>
    </svg>
  );
};

// ─── Urgency helpers ──────────────────────────────────────────────────────────

const urgencyBadge = (urgency) => {
  if (urgency === 'critical') return 'bg-red-500/15 text-red-400 border border-red-500/20';
  if (urgency === 'high') return 'bg-amber-500/15 text-accent-amber border border-amber-500/20';
  if (urgency === 'medium') return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
  return 'bg-brand-slate text-text-secondary border border-brand-slate-light';
};

const urgencyIcon = (urgency) => {
  if (urgency === 'critical') return <AlertTriangle size={14} className="text-red-400" />;
  if (urgency === 'high') return <Clock size={14} className="text-accent-amber" />;
  if (urgency === 'medium') return <Info size={14} className="text-blue-400" />;
  return <CheckCircle size={14} className="text-text-muted" />;
};

// ─── Premium Payment Modal ───────────────────────────────────────────────────

const PremiumModal = ({ nextPremium, policies, onClose }) => {
  const policy = policies.find((p) => p.shortName === nextPremium?.policyName) ?? policies[0];
  const payDate = nextPremium ? new Date(nextPremium.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="p-6 border-b border-brand-slate-light">
          <h3 className="text-white font-bold text-lg">Upcoming Premium Payment</h3>
          <p className="text-text-secondary text-sm mt-1">
            Payment due for <span className="text-accent-amber font-semibold">{nextPremium?.policyName ?? policy?.shortName}</span>
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center p-4 bg-brand-navy rounded-xl border border-brand-slate-light">
            <div>
              <p className="text-text-muted text-xs uppercase font-semibold tracking-wider mb-1">Amount Due</p>
              <p className="text-white font-bold text-2xl">${nextPremium?.amount?.toLocaleString() ?? '—'}/mo</p>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs uppercase font-semibold tracking-wider mb-1">Due Date</p>
              <p className="text-accent-amber font-semibold text-sm">{payDate}</p>
            </div>
          </div>

          {policy && (
            <div className="space-y-2">
              <p className="text-text-muted text-xs uppercase font-semibold tracking-wider">Carrier Contact</p>
              <div className="p-3 bg-brand-navy rounded-lg border border-brand-slate-light text-sm">
                <p className="text-white font-semibold">{policy.carrier}</p>
                <p className="text-text-secondary text-xs mt-1">Pay online at your carrier's member portal, or call the number on your policy documents.</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
            <span className="font-semibold">Tip:</span> Set up autopay through your carrier to avoid missed payments and potential lapse.
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
          {policy && (
            <button
              onClick={() => { onClose(); window.location.href = `/report/${policy.id}`; }}
              className="flex-1 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark rounded-lg text-sm font-bold transition-colors"
            >
              View Policy →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Portfolio Score Modal ───────────────────────────────────────────────────

const scoreBreakdownItems = [
  { label: 'Coverage Adequacy', value: 88, color: '#22c55e' },
  { label: 'Premium Efficiency', value: 81, color: '#22c55e' },
  { label: 'Beneficiary & Legal', value: 64, color: '#f59e0b' },
  { label: 'Policy Structure', value: 79, color: '#f59e0b' },
];

const PortfolioScoreModal = ({ score, policies, onClose, onViewPolicy }) => {
  const reviewItems = policies.flatMap((p) =>
    p.opportunities.filter((o) => o.severity === 'high' || o.severity === 'medium').map((o) => ({
      ...o,
      policyName: p.shortName,
      policyId: p.id,
    }))
  );

  const severityColor = (s) => {
    if (s === 'high') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (s === 'medium') return 'bg-amber-500/10 text-accent-amber border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-lg my-8 relative">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="p-6 border-b border-brand-slate-light flex items-center gap-5">
          <ScoreRing score={score} size={72} />
          <div>
            <h3 className="text-white font-bold text-lg">Portfolio Score</h3>
            <p className="text-text-secondary text-sm mt-0.5">
              {score >= 80 ? 'Good standing — minor improvements available' : 'Review needed — action items identified'}
            </p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="p-6 border-b border-brand-slate-light">
          <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-4">Score Breakdown</p>
          <div className="space-y-3">
            {scoreBreakdownItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
                <div className="h-1.5 bg-brand-navy rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review items */}
        <div className="p-6">
          <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-4">
            Items to Review ({reviewItems.length})
          </p>
          <div className="space-y-3">
            {reviewItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 p-3 bg-brand-navy rounded-xl border border-brand-slate-light">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="text-[10px] text-text-muted">{item.policyName}</span>
                  </div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                </div>
                <button
                  onClick={() => { onClose(); onViewPolicy(item.policyId); }}
                  className="flex-shrink-0 flex items-center gap-1 text-xs text-accent-amber font-semibold hover:underline"
                >
                  View <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
