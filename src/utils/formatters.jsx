import React from 'react';
import { AlertTriangle, Clock, Info, CheckCircle } from 'lucide-react';

export const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(0)}K`
    : `$${n.toLocaleString('en-US')}`;

export const fmtFull = (n) => '$' + n.toLocaleString('en-US');

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const urgencyBadge = (urgency) => {
  if (urgency === 'critical') return 'bg-red-500/15 text-red-400 border border-red-500/20';
  if (urgency === 'high') return 'bg-amber-500/15 text-accent-amber border border-amber-500/20';
  if (urgency === 'medium') return 'bg-blue-500/15 text-blue-400 border border-blue-500/20';
  return 'bg-brand-slate text-text-secondary border border-brand-slate-light';
};

export const urgencyIcon = (urgency) => {
  if (urgency === 'critical') return <AlertTriangle size={14} className="text-red-400" />;
  if (urgency === 'high') return <Clock size={14} className="text-accent-amber" />;
  if (urgency === 'medium') return <Info size={14} className="text-blue-400" />;
  return <CheckCircle size={14} className="text-text-muted" />;
};

export const severityBadge = (severity) => {
  if (severity === 'high') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (severity === 'medium') return 'bg-amber-500/10 text-accent-amber border-amber-500/20';
  return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
};

export const milestoneStyle = (type, isPast) => {
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
