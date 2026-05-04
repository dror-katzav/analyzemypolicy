import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, Sparkles } from 'lucide-react';

const AGENT_TASKS = (policy) => [
  { id: 1, label: 'Reading and parsing policy documents', duration: 1000 },
  { id: 2, label: `Pulling current ${policy.carrier} rates and product options`, duration: 1400 },
  { id: 3, label: 'Ranking action items by impact and urgency', duration: 1200 },
  { id: 4, label: 'Drafting beneficiary designation update letter', duration: 1600 },
  { id: 5, label: 'Building conversion cost comparison analysis', duration: 1300 },
  { id: 6, label: 'Generating your personalized action report', duration: 900 },
];

const AgentModal = ({ policy, onClose }) => {
  const [taskStates, setTaskStates] = useState(() =>
    AGENT_TASKS(policy).map((t) => ({ ...t, status: 'pending' }))
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    let delay = 600;
    const tasks = AGENT_TASKS(policy);
    tasks.forEach((task, i) => {
      setTimeout(() => {
        setTaskStates((prev) => prev.map((t) => t.id === task.id ? { ...t, status: 'running' } : t));
        setTimeout(() => {
          setTaskStates((prev) => prev.map((t) => t.id === task.id ? { ...t, status: 'done' } : t));
          if (i === tasks.length - 1) setTimeout(() => setDone(true), 400);
        }, task.duration);
      }, delay);
      delay += task.duration + 200;
    });
  }, [policy]);

  const StatusIcon = ({ status }) => {
    if (status === 'done') return <CheckCircle size={15} className="text-green-400 flex-shrink-0" />;
    if (status === 'running') return <Clock size={15} className="text-accent-amber animate-spin flex-shrink-0" />;
    return <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-slate-light flex-shrink-0" />;
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative shadow-2xl">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>

        {!done ? (
          <div className="p-6 md:p-8">
            <div className="w-12 h-12 bg-accent-amber/10 border border-accent-amber/20 rounded-2xl flex items-center justify-center mb-5">
              <Sparkles size={22} className="text-accent-amber" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">AnalyzeMyPolicy Agent</h3>
            <p className="text-text-secondary text-sm mb-6">
              Taking action on your <strong className="text-white">{policy.name}</strong> policy…
            </p>

            <div className="space-y-3">
              {taskStates.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                    task.status === 'running'
                      ? 'border-accent-amber/40 bg-accent-amber/5'
                      : task.status === 'done'
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-brand-slate-light bg-brand-navy/30'
                  }`}
                >
                  <StatusIcon status={task.status} />
                  <span className={`text-sm ${
                    task.status === 'done' ? 'text-text-secondary line-through'
                    : task.status === 'running' ? 'text-white font-medium'
                    : 'text-text-muted'
                  }`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              Agent working autonomously…
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">All Done!</h3>
            <p className="text-text-secondary text-sm mb-6">
              Done. We've drafted your beneficiary update letter, built a side-by-side conversion cost analysis, and compiled a prioritized action report — all sent to your email.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['6', 'Items analyzed'], ['3', 'Docs drafted'], ['1', 'Report sent']].map(([v, l]) => (
                <div key={l} className="bg-brand-navy rounded-xl p-3 border border-brand-slate-light">
                  <p className="text-accent-amber font-bold text-xl">{v}</p>
                  <p className="text-text-muted text-[11px] mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <button
              className="w-full py-3 px-6 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg transition-colors text-sm"
              onClick={onClose}
            >
              View My Action Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentModal;
