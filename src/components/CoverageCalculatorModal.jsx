import React, { useState, useMemo } from 'react';
import { X, Calculator, ChevronRight, TrendingUp, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmtM = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

// ─── Actuarial estimate tables ────────────────────────────────────────────────
// Simplified from SOA 2017 CSO table + expense loading, non-smoker preferred class.
// Values are monthly premium per $500K, 20-year term.
const TERM_MONTHLY_RANGES = [
  { ageLabel: '25–30', min: 14, max: 22 },
  { ageLabel: '30–35', min: 18, max: 30 },
  { ageLabel: '35–40', min: 26, max: 42 },
  { ageLabel: '40–45', min: 40, max: 65 },
  { ageLabel: '45–50', min: 65, max: 105 },
  { ageLabel: '50–55', min: 105, max: 165 },
  { ageLabel: '55–60', min: 165, max: 270 },
];

const AGE_BRACKETS = ['25–30', '30–35', '35–40', '40–45', '45–50', '50–55', '55–60'];

// Scale estimate to requested coverage (base is $500K)
const estimatePremium = (ageBracket, coverageAmount) => {
  const row = TERM_MONTHLY_RANGES.find((r) => r.ageLabel === ageBracket);
  if (!row) return null;
  const scale = coverageAmount / 500_000;
  return { min: Math.round(row.min * scale), max: Math.round(row.max * scale) };
};

// ─── Quote engines ────────────────────────────────────────────────────────────
// These are the main multi-carrier comparison platforms. URL params pre-fill
// coverage amount where the platform's public URL format supports it.
const QUOTE_ENGINES = [
  {
    name: 'Policygenius',
    desc: 'Compares 30+ carriers — most comprehensive',
    badge: 'Best for comparison',
    badgeColor: 'text-accent-amber bg-amber-500/10 border-amber-500/20',
    url: (coverage) =>
      `https://www.policygenius.com/life-insurance/quotes/?coverage_amount=${coverage}&utm_source=analyzemypolicy`,
  },
  {
    name: 'Bestow',
    desc: 'Instant decisions, no medical exam required',
    badge: 'Fastest quote',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    url: () => 'https://bestow.com/get-a-quote/?utm_source=analyzemypolicy',
  },
  {
    name: 'Ladder Life',
    desc: 'Flexible coverage you can adjust over time',
    badge: 'Most flexible',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    url: () => 'https://www.ladderlife.com/apply?utm_source=analyzemypolicy',
  },
  {
    name: 'Haven Life',
    desc: 'Backed by MassMutual — strong financial ratings',
    badge: 'Most trusted',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    url: () => 'https://havenlife.com/quotes?utm_source=analyzemypolicy',
  },
];

// ─── Input row ────────────────────────────────────────────────────────────────

const InputRow = ({ label, hint, value, onChange, prefix = '$', step = 10000, min = 0 }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</label>
      {hint && <span className="text-[10px] text-text-muted">{hint}</span>}
    </div>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">{prefix}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full pl-7 pr-3 py-2.5 bg-brand-navy border border-brand-slate-light rounded-lg text-sm text-white outline-none focus:border-accent-amber/60 transition-colors"
      />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function CoverageCalculatorModal({ currentCoverage = 0, onClose }) {
  const navigate = useNavigate();
  const [income, setIncome] = useState(150000);
  const [years, setYears] = useState(10);
  const [mortgage, setMortgage] = useState(400000);
  const [otherDebt, setOtherDebt] = useState(50000);
  const [savings, setSavings] = useState(100000);
  const [childCosts, setChildCosts] = useState(50000);
  const [ageBracket, setAgeBracket] = useState('35–40');

  const result = useMemo(() => {
    const incomeReplacement = income * years;
    const totalNeeds = incomeReplacement + mortgage + otherDebt + childCosts;
    const recommended = Math.max(0, totalNeeds - savings);
    const gap = recommended - currentCoverage;
    return { incomeReplacement, totalNeeds, recommended, gap };
  }, [income, years, mortgage, otherDebt, savings, childCosts, currentCoverage]);

  const gapStatus = result.gap <= 0 ? 'covered' : result.gap < 500_000 ? 'partial' : 'gap';
  const estimate = estimatePremium(ageBracket, result.recommended);

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-brand-slate-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
              <Calculator size={18} className="text-accent-amber" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Coverage Gap Calculator</h3>
              <p className="text-text-secondary text-sm">Estimate how much coverage you need — then get real quotes.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label="Annual Income" hint="Pre-tax" value={income} onChange={setIncome} step={5000} />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Income Replacement</label>
                <span className="text-[10px] text-text-muted">years</span>
              </div>
              <input
                type="number"
                min={1}
                max={30}
                step={1}
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-3 py-2.5 bg-brand-navy border border-brand-slate-light rounded-lg text-sm text-white outline-none focus:border-accent-amber/60 transition-colors"
              />
            </div>
            <InputRow label="Mortgage Balance" value={mortgage} onChange={setMortgage} step={10000} />
            <InputRow label="Other Debts" hint="Car, student loans…" value={otherDebt} onChange={setOtherDebt} step={5000} />
            <InputRow label="Liquid Savings" hint="Investments, cash" value={savings} onChange={setSavings} step={10000} />
            <InputRow label="Child / Dependent Costs" hint="Education, care" value={childCosts} onChange={setChildCosts} step={5000} />
          </div>

          {/* Breakdown */}
          <div className="bg-brand-navy rounded-xl border border-brand-slate-light p-4 space-y-2.5">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Your Calculation</p>
            {[
              { label: `Income × ${years} yrs`, value: result.incomeReplacement },
              { label: 'Mortgage + Debts', value: mortgage + otherDebt },
              { label: 'Dependent costs', value: childCosts },
              { label: '− Savings / assets', value: -savings, neg: true },
            ].map(({ label, value, neg }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className={neg ? 'text-green-400 font-semibold' : 'text-white font-semibold'}>
                  {neg ? `−${fmtM(Math.abs(value))}` : fmtM(value)}
                </span>
              </div>
            ))}
            <div className="border-t border-brand-slate-light pt-2.5 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Recommended Coverage</span>
              <span className="text-accent-amber font-bold text-xl">{fmtM(result.recommended)}</span>
            </div>
          </div>

          {/* Gap status */}
          <div className={`rounded-xl border p-4 ${
            gapStatus === 'covered' ? 'bg-green-500/10 border-green-500/20'
            : gapStatus === 'partial' ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {gapStatus === 'covered'
                ? <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                : gapStatus === 'partial'
                ? <TrendingUp size={20} className="text-accent-amber flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />}
              <div>
                <p className={`font-bold text-sm mb-0.5 ${
                  gapStatus === 'covered' ? 'text-green-400' : gapStatus === 'partial' ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  {gapStatus === 'covered'
                    ? `You're covered — ${fmtM(Math.abs(result.gap))} surplus`
                    : gapStatus === 'partial'
                    ? `Small gap — ${fmtM(result.gap)} more recommended`
                    : `Coverage gap — ${fmtM(result.gap)} more needed`}
                </p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {currentCoverage > 0
                    ? `Current coverage: ${fmtM(currentCoverage)} · Recommended: ${fmtM(result.recommended)}`
                    : `No existing coverage detected. Recommended: ${fmtM(result.recommended)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Estimated premium (actuarial) */}
          {result.recommended > 0 && (
            <div className="bg-brand-navy rounded-xl border border-brand-slate-light p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Estimated Monthly Premium
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted">Your age bracket:</span>
                  <select
                    value={ageBracket}
                    onChange={(e) => setAgeBracket(e.target.value)}
                    className="text-[11px] bg-brand-slate border border-brand-slate-light rounded px-2 py-1 text-white outline-none"
                  >
                    {AGE_BRACKETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              {estimate ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-bold text-2xl">${estimate.min}–${estimate.max}</span>
                  <span className="text-text-muted text-sm">/month</span>
                  <span className="text-[10px] text-text-muted ml-auto">for {fmtM(result.recommended)} 20-yr term · non-smoker</span>
                </div>
              ) : (
                <p className="text-text-muted text-sm">Select your age bracket for an estimate.</p>
              )}
              <p className="text-[10px] text-text-muted mt-1.5">
                Based on SOA 2017 CSO mortality table. Actual quotes may vary by health class, carrier, and state.
              </p>
            </div>
          )}

          {/* Real quote engines */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Get Real Quotes From These Platforms</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUOTE_ENGINES.map((engine) => (
                <a
                  key={engine.name}
                  href={engine.url(result.recommended || 500000)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-brand-navy rounded-lg border border-brand-slate-light hover:border-accent-amber/40 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm group-hover:text-accent-amber transition-colors">
                        {engine.name}
                      </p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${engine.badgeColor}`}>
                        {engine.badge}
                      </span>
                    </div>
                    <p className="text-text-muted text-[11px] truncate">{engine.desc}</p>
                  </div>
                  <ExternalLink size={13} className="text-text-muted group-hover:text-accent-amber flex-shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

          {gapStatus !== 'covered' && (
            <button
              onClick={() => { onClose(); navigate('/analyze'); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
            >
              Analyze an Existing Policy Instead <ChevronRight size={15} />
            </button>
          )}

          <p className="text-center text-[10px] text-text-muted">
            Estimates use simplified actuarial tables and are for illustration only — not financial or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
