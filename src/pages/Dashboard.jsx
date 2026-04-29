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
} from 'lucide-react';
import AppNav from '../components/AppNav';
import {
  MOCK_USER,
  MOCK_POLICIES,
  PORTFOLIO_SUMMARY,
  UPCOMING_EVENTS,
  PORTFOLIO_CASH_VALUE,
} from '../data/mockData';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

const fmtFull = (n) =>
  '$' + n.toLocaleString('en-US');

// ─── SVG Cash Value Chart ────────────────────────────────────────────────────

const CashValueChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);

  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 24, bottom: 36, left: 56 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const allValues = data
    .map((d) => d.actual ?? d.projected ?? 0)
    .filter(Boolean);
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
    .map((d) => ({
      x: xp(d.year),
      y: yp(d.projected ?? d.actual),
      ...d,
    }));

  const toPolyline = (pts) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ');

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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 220 }}
        onMouseLeave={() => setTooltip(null)}
      >
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
          {/* Grid lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={0} y1={yp(v)} x2={cw} y2={yp(v)}
                stroke="#334155" strokeWidth="1"
              />
              <text
                x={-8} y={yp(v) + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {v === 0 ? '$0' : fmt(v)}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {xTicks.map((yr) => (
            <text
              key={yr}
              x={xp(yr)} y={ch + 20}
              textAnchor="middle"
              fontSize="10"
              fill={yr === 2026 ? '#f59e0b' : '#64748b'}
              fontWeight={yr === 2026 ? 'bold' : 'normal'}
            >
              {yr}
            </text>
          ))}

          {/* Current year line */}
          <line
            x1={currentX} y1={0} x2={currentX} y2={ch}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.5"
          />
          <text x={currentX + 4} y={10} fontSize="9" fill="#f59e0b" opacity="0.8">
            Today
          </text>

          {/* Projected area */}
          {projectedPts.length > 1 && (
            <polygon
              points={toArea(projectedPts)}
              fill="url(#projGrad)"
            />
          )}

          {/* Actual area */}
          {actualPts.length > 1 && (
            <polygon
              points={toArea(actualPts)}
              fill="url(#actualGrad)"
            />
          )}

          {/* Projected line (dashed) */}
          {projectedPts.length > 1 && (
            <polyline
              points={toPolyline(projectedPts)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.6"
            />
          )}

          {/* Actual line */}
          {actualPts.length > 1 && (
            <polyline
              points={toPolyline(actualPts)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
          )}

          {/* Interactive dots */}
          {[...actualPts, ...projectedPts.slice(1)].map((pt, i) => (
            <circle
              key={i}
              cx={pt.x} cy={pt.y} r="4"
              fill={pt.actual !== undefined ? '#f59e0b' : '#1e293b'}
              stroke="#f59e0b"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseEnter={() =>
                setTooltip({
                  x: pt.x,
                  y: pt.y,
                  year: pt.year,
                  value: pt.actual ?? pt.projected,
                  isProjected: pt.projected !== undefined && pt.actual === undefined,
                })
              }
            />
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g transform={`translate(${Math.min(tooltip.x, cw - 80)},${Math.max(tooltip.y - 48, 0)})`}>
              <rect x={0} y={0} width={90} height={38} rx={6} fill="#1e293b" stroke="#334155" />
              <text x={8} y={14} fontSize="10" fill="#94a3b8">
                {tooltip.year} {tooltip.isProjected ? '(proj.)' : ''}
              </text>
              <text x={8} y={29} fontSize="13" fill="#f59e0b" fontWeight="bold">
                {fmtFull(tooltip.value)}
              </text>
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
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle" fontSize="13"
        fill={color} fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  );
};

// ─── Urgency badge helper ────────────────────────────────────────────────────

const urgencyBadge = (urgency) => {
  if (urgency === 'critical')
    return 'bg-red-500/15 text-red-400 border border-red-500/20';
  if (urgency === 'high')
    return 'bg-amber-500/15 text-accent-amber border border-amber-500/20';
  if (urgency === 'medium')
    return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
  return 'bg-brand-slate text-text-secondary border border-brand-slate-light';
};

const urgencyIcon = (urgency) => {
  if (urgency === 'critical') return <AlertTriangle size={14} className="text-red-400" />;
  if (urgency === 'high') return <Clock size={14} className="text-accent-amber" />;
  if (urgency === 'medium') return <Info size={14} className="text-blue-400" />;
  return <CheckCircle size={14} className="text-text-muted" />;
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { totalCoverage, totalMonthlyPremium, estimatedCashValue, portfolioScore } =
    PORTFOLIO_SUMMARY;

  const kpiCards = [
    {
      label: 'Total Coverage',
      value: fmt(totalCoverage),
      sub: `${MOCK_POLICIES.length} active policies`,
      icon: <Shield size={20} className="text-blue-400" />,
      iconBg: 'bg-blue-500/10',
    },
    {
      label: 'Est. Cash Value',
      value: fmt(estimatedCashValue),
      sub: '+8.9% this year',
      icon: <TrendingUp size={20} className="text-green-400" />,
      iconBg: 'bg-green-500/10',
    },
    {
      label: 'Monthly Premium',
      value: `$${totalMonthlyPremium.toLocaleString()}`,
      sub: 'Next due Apr 28',
      icon: <DollarSign size={20} className="text-accent-amber" />,
      iconBg: 'bg-amber-500/10',
    },
    {
      label: 'Portfolio Score',
      value: portfolioScore,
      isScore: true,
      sub: 'Good — 1 item to review',
      icon: null,
      iconBg: '',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="dashboard" />

      {/* Page header */}
      <div className="px-6 md:px-8 py-8 border-b border-brand-slate-light">
        <h1 className="text-2xl font-bold text-white">
          Good morning, {MOCK_USER.firstName} 👋
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Your policy portfolio is up to date. One action item needs attention.
        </p>
      </div>

      <div className="flex-1 px-6 md:px-8 py-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="bg-brand-slate border border-brand-slate-light rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  {card.label}
                </span>
                {card.icon && (
                  <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                )}
              </div>
              {card.isScore ? (
                <div className="flex items-center gap-3">
                  <ScoreRing score={card.value} size={52} />
                  <div>
                    <p className="text-white font-bold text-2xl leading-none">{card.value}</p>
                    <p className="text-text-muted text-xs mt-1">/100</p>
                  </div>
                </div>
              ) : (
                <p className="text-white font-bold text-2xl leading-tight">{card.value}</p>
              )}
              <p className="text-text-muted text-xs mt-2">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 bg-brand-slate border border-brand-slate-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-white font-bold">Cash Value Growth</h2>
                <p className="text-text-muted text-xs mt-0.5">
                  Historical & projected · MetLife Whole Life
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-[2px] bg-accent-amber inline-block"></span>
                  Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-[2px] bg-accent-amber opacity-50 border-dashed inline-block" style={{ borderBottom: '2px dashed' }}></span>
                  Projected
                </span>
              </div>
            </div>
            <CashValueChart data={PORTFOLIO_CASH_VALUE} />
          </div>

          {/* Upcoming Events */}
          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold">Upcoming Events</h2>
              <Calendar size={18} className="text-text-muted" />
            </div>
            <div className="space-y-3">
              {UPCOMING_EVENTS.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-brand-slate-light hover:border-accent-amber/40 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/report/${ev.policyId}`)}
                >
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${urgencyBadge(ev.urgency)}`}>
                    {ev.daysAway === 0 ? 'TODAY' : `${ev.daysAway}d`}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium leading-snug group-hover:text-accent-amber transition-colors truncate">
                      {ev.label}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{ev.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Cards */}
        <div>
          <h2 className="text-white font-bold mb-4">Your Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_POLICIES.map((policy) => {
              const scoreColor =
                policy.score >= 80
                  ? 'text-green-400'
                  : policy.score >= 65
                  ? 'text-accent-amber'
                  : 'text-red-400';
              const urgentMilestone = policy.milestones.find(
                (m) => m.isUrgent
              );

              return (
                <div
                  key={policy.id}
                  className="bg-brand-slate border border-brand-slate-light rounded-xl p-6 hover:border-accent-amber/40 cursor-pointer transition-all group"
                  onClick={() => navigate(`/report/${policy.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: policy.carrierColor }}
                      >
                        {policy.carrierInitials}
                      </div>
                      <div>
                        <h3 className="text-white font-bold leading-tight group-hover:text-accent-amber transition-colors">
                          {policy.name}
                        </h3>
                        <p className="text-text-muted text-xs mt-0.5">
                          {policy.type} · {policy.carrier}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ScoreRing score={policy.score} size={44} />
                      <span className={`text-[10px] font-bold ${scoreColor}`}>
                        {policy.scoreLabel}
                      </span>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-1">
                        Coverage
                      </p>
                      <p className="text-white font-bold">{fmt(policy.faceAmount)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-1">
                        Premium
                      </p>
                      <p className="text-white font-bold">${policy.premium}/mo</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-1">
                        Cash Value
                      </p>
                      <p className="text-white font-bold">
                        {policy.cashValue > 0 ? fmt(policy.cashValue) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Alert strip */}
                  {urgentMilestone && (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
                      {urgencyIcon(policy.nextPremiumDaysAway === 0 ? 'critical' : 'high')}
                      <span className="text-accent-amber font-medium">{urgentMilestone.label}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-text-muted">
                      {policy.opportunities.length} opportunity
                      {policy.opportunities.length !== 1 ? 's' : ''} identified
                    </span>
                    <span className="flex items-center gap-1 text-xs text-accent-amber font-semibold group-hover:translate-x-0.5 transition-transform">
                      View analysis <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA banner */}
        <div className="bg-gradient-to-r from-brand-slate to-brand-navy border border-brand-slate-light rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-lg">Add Another Policy</h3>
            <p className="text-text-secondary text-sm mt-1">
              Upload a policy document, illustration, or statement to get a full analysis.
            </p>
          </div>
          <button
            className="flex-shrink-0 px-6 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
            onClick={() => navigate('/analyze')}
          >
            + Analyze a Policy
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-brand-slate-light text-center text-xs text-text-muted">
        🔒 Bank-grade encryption · SOC 2 compliant · Your data is never sold ·{' '}
        <span className="text-accent-amber">Powered by Atidot</span>
      </footer>
    </div>
  );
};

export default Dashboard;
