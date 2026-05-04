import React from 'react';
import { X } from 'lucide-react';

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

export default PremiumModal;
