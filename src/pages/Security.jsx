import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Server, CheckCircle, ArrowLeft } from 'lucide-react';

const BADGES = [
  { label: 'SOC 2 Type II', sub: 'Audited annually', icon: <Shield size={20} className="text-accent-amber" /> },
  { label: 'AES-256 Encryption', sub: 'Data at rest', icon: <Lock size={20} className="text-blue-400" /> },
  { label: 'TLS 1.3', sub: 'In transit', icon: <Server size={20} className="text-green-400" /> },
  { label: 'Zero Data Selling', sub: 'Your data stays yours', icon: <Eye size={20} className="text-purple-400" /> },
];

const SECTIONS = [
  {
    title: 'Data Encryption',
    items: [
      'All data is encrypted at rest using AES-256.',
      'All data in transit is protected by TLS 1.3.',
      'Encryption keys are rotated on a regular schedule and stored in a dedicated key management service.',
    ],
  },
  {
    title: 'Access Controls',
    items: [
      'Role-based access control (RBAC) limits employee access to data on a need-to-know basis.',
      'Multi-factor authentication is required for all internal systems.',
      'Access logs are retained and reviewed regularly.',
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      'Infrastructure is hosted on SOC 2 Type II certified cloud providers.',
      'Automated backups run daily with point-in-time recovery.',
      'Vulnerability scanning and penetration testing are performed regularly.',
    ],
  },
  {
    title: 'Privacy',
    items: [
      'We never sell or share your personal or policy data with third parties.',
      'Policy documents are processed solely for analysis and are not retained beyond your session unless you choose to save them.',
      'You may request deletion of all your data at any time by contacting support.',
    ],
  },
];

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-10 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="flex items-center gap-3 mb-3">
          <Shield size={28} className="text-accent-amber" />
          <h1 className="text-3xl font-extrabold text-white">Security &amp; Privacy</h1>
        </div>
        <p className="text-text-secondary text-base mb-10 leading-relaxed">
          AnalyzeMyPolicy is built on institutional-grade security infrastructure. Here's how we protect your data.
        </p>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {BADGES.map((b) => (
            <div key={b.label} className="bg-brand-slate border border-brand-slate-light rounded-xl p-4 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center">
                {b.icon}
              </div>
              <p className="text-white font-bold text-sm leading-tight">{b.label}</p>
              <p className="text-text-muted text-xs">{b.sub}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">{s.title}</h2>
              <ul className="space-y-3">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-secondary text-sm leading-relaxed">
                    <CheckCircle size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 bg-brand-slate border border-brand-slate-light rounded-xl text-center">
          <p className="text-text-secondary text-sm">
            Questions about security or data handling?{' '}
            <a href="mailto:security@analyzemypolicy.com" className="text-accent-amber hover:underline font-semibold">
              security@analyzemypolicy.com
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
