import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';

const SendReportModal = ({ policy, user, onClose }) => {
  const [advisorEmail, setAdvisorEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Policy Holder';

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-md relative shadow-2xl">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" onClick={onClose}>
          <X size={20} />
        </button>

        {!sent ? (
          <div className="p-6 md:p-8">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-5">
              <Mail size={22} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-1">Send Report to Advisor</h3>
            <p className="text-slate-500 text-sm mb-6">
              We'll send a full analysis of your <strong>{policy.name}</strong> with recommendations directly to your advisor.
            </p>

            <div className="space-y-3 mb-6">
              {/* Read-only sender info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{fullName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Advisor Email *
                </label>
                <input
                  type="email"
                  placeholder="advisor@example.com"
                  value={advisorEmail}
                  onChange={(e) => setAdvisorEmail(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Note (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="I'd like to discuss the conversion option…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <button
              disabled={!advisorEmail}
              className="w-full py-3 px-6 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setSent(true)}
            >
              Send Report
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Report Sent!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Your advisor will receive a complete analysis of your {policy.name} with personalized recommendations.
            </p>
            <button
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg text-sm transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendReportModal;
