import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, BarChart2, Shield, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: <Upload size={28} className="text-accent-amber" />,
    title: 'Upload a Policy',
    desc: 'Drop any life insurance document — PDF, image, or illustration. Our AI reads it in seconds.',
  },
  {
    icon: <BarChart2 size={28} className="text-blue-400" />,
    title: 'Get Your AI Analysis',
    desc: 'We score your policy, identify opportunities, and run Atidot Nexus lapse-risk intelligence on it.',
  },
  {
    icon: <Shield size={28} className="text-green-400" />,
    title: 'Track Your Portfolio',
    desc: 'Monitor premiums, cash value growth, upcoming milestones, and take action — all in one place.',
  },
];

export default function OnboardingModal({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative shadow-2xl">
        <button
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-accent-amber' : i < step ? 'w-3 bg-accent-amber/50' : 'w-3 bg-brand-slate-light'
              }`}
            />
          ))}
        </div>

        <div className="p-6 md:p-8">
          {/* Step content */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-navy border border-brand-slate-light flex items-center justify-center mb-5">
              {STEPS[step].icon}
            </div>
            <h3 className="text-white font-bold text-xl mb-2">{STEPS[step].title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">{STEPS[step].desc}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Back
              </button>
            )}
            {!isLast ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => { onClose(); navigate('/analyze'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
              >
                <Upload size={15} /> Upload My First Policy
              </button>
            )}
          </div>

          {/* Skip */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-center text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
