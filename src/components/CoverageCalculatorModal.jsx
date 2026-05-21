import React, { useState, useMemo } from 'react';
import { X, Calculator, ChevronRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n}`;

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

export default function CoverageCalculatorModal({ currentCoverage = 0, onClose }) {
  const navigate = useNavigate();
  const [income, setIncome] = useState(150000);
  const [years, setYears] = useState(10);
  const [mortgage, setMortgage] = useState(400000);
  const [otherDebt, setOtherDebt] = useState(50000);
  const [savings, setSavings] = useState(100000);
  const [childCosts, setChildCosts] = useState(50000);

  const result = useMemo(() => {
    const incomeReplacement = income * years;
    const totalNeeds = incomeReplacement + mortgage + otherDebt + childCosts;
    const recommended = Math.max(0, totalNeeds - savings);
    const gap = recommended - currentCoverage;
    return { incomeReplacement, totalNeeds, recommended, gap };
  }, [income, years, mortgage, otherDebt, savings, childCosts, currentCoverage]);

  const gapStatus = result.gap <= 0 ? 'covered' : result.gap < 500_000 ? 'partial' : 'gap';

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-lg relative shadow-2xl max-h-[90vh] overflow-y-auto">
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
              <p className="text-text-secondary text-sm">Estimate how much life insurance you need.</p>
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
                  {neg ? `−${fmt(Math.abs(value))}` : fmt(value)}
                </span>
              </div>
            ))}
            <div className="border-t border-brand-slate-light pt-2.5 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Recommended Coverage</span>
              <span className="text-accent-amber font-bold text-lg">{fmt(result.recommended)}</span>
            </div>
          </div>

          {/* Gap result */}
          <div className={`rounded-xl border p-4 ${
            gapStatus === 'covered'
              ? 'bg-green-500/10 border-green-500/20'
              : gapStatus === 'partial'
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {gapStatus === 'covered'
                ? <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                : gapStatus === 'partial'
                ? <TrendingUp size={20} className="text-accent-amber flex-shrink-0 mt-0.5" />
                : <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`font-bold text-sm mb-0.5 ${
                  gapStatus === 'covered' ? 'text-green-400' : gapStatus === 'partial' ? 'text-accent-amber' : 'text-red-400'
                }`}>
                  {gapStatus === 'covered'
                    ? `You're covered — ${fmt(Math.abs(result.gap))} surplus`
                    : gapStatus === 'partial'
                    ? `Small gap — ${fmt(result.gap)} more recommended`
                    : `Coverage gap — ${fmt(result.gap)} more needed`}
                </p>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {currentCoverage > 0
                    ? `Current coverage: ${fmt(currentCoverage)} · Recommended: ${fmt(result.recommended)}`
                    : `No policies found. Recommended coverage: ${fmt(result.recommended)}`}
                </p>
              </div>
            </div>
          </div>

          {gapStatus !== 'covered' && (
            <button
              onClick={() => { onClose(); navigate('/analyze'); }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
            >
              Analyze a Policy to Close the Gap <ChevronRight size={15} />
            </button>
          )}

          <p className="text-center text-[10px] text-text-muted">
            This is an estimate for illustrative purposes only — not financial or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
