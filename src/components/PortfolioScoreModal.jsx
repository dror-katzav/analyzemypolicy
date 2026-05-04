import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import ScoreRing from './ScoreRing';

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

export default PortfolioScoreModal;
