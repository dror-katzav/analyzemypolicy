import React, { useState } from 'react';
import { X, DollarSign, ExternalLink, CheckCircle, Clock, CreditCard, Bell } from 'lucide-react';

// Carrier portal URLs
const CARRIER_PORTALS = {
  MetLife: 'https://www.metlife.com/mybenefits',
  'Protective Life': 'https://www.protective.com/myaccount',
  Prudential: 'https://www.prudential.com/personal/sign-in',
  AIG: 'https://www.aig.com/individual/life-insurance',
  Nationwide: 'https://myaccount.nationwide.com',
  Transamerica: 'https://www.transamerica.com/policyholders',
};

const CARRIER_PHONES = {
  MetLife: '1-800-638-5433',
  'Protective Life': '1-800-888-2461',
  Prudential: '1-800-778-2255',
  AIG: '1-800-888-2452',
  Nationwide: '1-877-669-6877',
  Transamerica: '1-800-797-2643',
};

const PremiumModal = ({ nextPremium, policies, onClose }) => {
  const policy =
    policies.find((p) => p.shortName === nextPremium?.policyName || p.id === nextPremium?.policyId) ??
    policies[0];
  const [paid, setPaid] = useState(false);

  const daysAway = nextPremium
    ? Math.round(
        (new Date(nextPremium.date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
      )
    : null;

  const portalUrl = policy ? CARRIER_PORTALS[policy.carrier] : null;
  const phone = policy ? CARRIER_PHONES[policy.carrier] : null;

  if (paid) {
    return (
      <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Payment Logged</h3>
          <p className="text-text-secondary text-sm mb-4">
            Marked your{' '}
            <span className="text-white font-semibold">{policy?.carrier}</span> payment of{' '}
            <span className="text-accent-amber font-bold">${nextPremium?.amount?.toLocaleString()}</span> as paid.
          </p>
          <p className="text-text-muted text-xs mb-6">
            If you haven't yet paid your carrier directly, please do so to prevent a lapse in coverage.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-brand-slate-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-amber/10 flex items-center justify-center flex-shrink-0">
              <DollarSign size={18} className="text-accent-amber" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Premium Payment Due</h3>
              <p className="text-text-secondary text-sm">
                {policy?.carrier} · {policy?.name ?? nextPremium?.policyName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount + date */}
          <div className="flex gap-3">
            <div className="flex-1 p-4 bg-brand-navy rounded-xl border border-brand-slate-light text-center">
              <p className="text-text-muted text-[11px] uppercase font-semibold tracking-wider mb-1">
                Amount Due
              </p>
              <p className="text-white font-bold text-2xl">${nextPremium?.amount?.toLocaleString()}</p>
              <p className="text-text-muted text-xs mt-0.5">per month</p>
            </div>
            <div className="flex-1 p-4 bg-brand-navy rounded-xl border border-brand-slate-light text-center">
              <p className="text-text-muted text-[11px] uppercase font-semibold tracking-wider mb-1">
                Due Date
              </p>
              <p className="text-accent-amber font-bold text-sm leading-snug mt-1">
                {nextPremium
                  ? new Date(nextPremium.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
              {daysAway !== null && (
                <p
                  className={`text-xs mt-1 font-semibold ${
                    daysAway <= 3 ? 'text-red-400' : 'text-text-muted'
                  }`}
                >
                  {daysAway <= 0 ? 'Due today' : `in ${daysAway} day${daysAway !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>

          {/* How to pay */}
          <div>
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-2">
              How to Pay
            </p>
            <div className="space-y-2">
              {portalUrl && (
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-brand-navy rounded-lg border border-brand-slate-light hover:border-accent-amber/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-accent-amber flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold group-hover:text-accent-amber transition-colors">
                        Pay Online — {policy?.carrier} Portal
                      </p>
                      <p className="text-text-muted text-xs">Instant · Secure · Carrier-direct</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-text-muted group-hover:text-accent-amber flex-shrink-0 ml-2" />
                </a>
              )}
              <div className="flex items-center gap-3 p-3 bg-brand-navy rounded-lg border border-brand-slate-light">
                <Clock size={16} className="text-text-muted flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">Pay by Phone</p>
                  <p className="text-text-muted text-xs">
                    {phone ?? 'Call the number on your policy documents'} · Mon–Fri 8 AM–8 PM ET
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Autopay tip */}
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <Bell size={15} className="text-accent-amber flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="font-semibold">Set up autopay</span> through your carrier portal to
              avoid late fees and coverage lapse. Most carriers provide a 31-day grace period.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Remind Me Later
          </button>
          <button
            onClick={() => setPaid(true)}
            className="flex-1 py-2.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={15} /> Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
