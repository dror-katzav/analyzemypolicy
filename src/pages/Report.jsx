import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield, DollarSign, Calendar, CheckCircle, Clock,
  TrendingUp, Mail, Zap, ChevronDown, ChevronUp,
  Bot, Info, X, AlertTriangle, Sparkles, Download,
  FileText, BarChart2, Users, FileCheck, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useAIChat } from '../context/AIChatContext';
import { usePolicies } from '../context/PoliciesContext';
import { fmt, fmtDate, milestoneStyle } from '../utils/formatters';
import ScoreRing from '../components/ScoreRing';
import AgentModal from '../components/AgentModal';
import SendReportModal from '../components/SendReportModal';
import { getNexusAnalysis, riskColor } from '../utils/nexusApi';

// ─── Download Docs Modal ──────────────────────────────────────────────────────

const DOC_TYPES = [
  { icon: <FileText size={16} className="text-accent-amber" />, label: 'Policy Contract', desc: 'Full policy document · PDF' },
  { icon: <BarChart2 size={16} className="text-blue-400" />, label: 'Policy Illustration', desc: 'Cash value & benefit projections · PDF' },
  { icon: <Calendar size={16} className="text-green-400" />, label: 'Premium Schedule', desc: 'Payment schedule & history · PDF' },
  { icon: <Users size={16} className="text-purple-400" />, label: 'Beneficiary Designation Form', desc: 'Current on-file designations · PDF' },
  { icon: <FileCheck size={16} className="text-text-muted" />, label: 'AnalyzeMyPolicy Report', desc: 'Full AI analysis report · PDF' },
];

const DownloadDocsModal = ({ policy, onClose }) => {
  const [downloaded, setDownloaded] = useState({});

  const handleDownload = (label) => {
    setDownloaded((prev) => ({ ...prev, [label]: true }));
    // Simulate download by creating a blob with the policy name
    const blob = new Blob(
      [`AnalyzeMyPolicy — ${policy.name}\n${label}\n\nDocument content would be generated server-side in production.`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.name.replace(/\s+/g, '_')}_${label.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-text-muted hover:text-white" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="p-6 border-b border-brand-slate-light">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-amber/10 flex items-center justify-center">
              <Download size={17} className="text-accent-amber" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Policy Documents</h3>
              <p className="text-text-secondary text-sm">{policy.name}</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {DOC_TYPES.map((doc) => (
            <div
              key={doc.label}
              className="flex items-center justify-between p-3 bg-brand-navy rounded-lg border border-brand-slate-light"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-slate flex items-center justify-center flex-shrink-0">
                  {doc.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{doc.label}</p>
                  <p className="text-text-muted text-xs">{doc.desc}</p>
                </div>
              </div>
              {downloaded[doc.label] ? (
                <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                  <CheckCircle size={13} /> Saved
                </span>
              ) : (
                <button
                  onClick={() => handleDownload(doc.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-slate border border-brand-slate-light hover:border-accent-amber/40 text-text-secondary hover:text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download size={12} /> Download
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 pt-2">
          <p className="text-center text-[10px] text-text-muted">
            🔒 Documents are encrypted at rest and transmitted over TLS 1.3
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Nexus Intelligence Card ──────────────────────────────────────────────────

const NEXUS_SIGNALS = {
  Low: [
    { ok: true,  text: 'Premium-to-coverage ratio is strong for this policy type' },
    { ok: true,  text: 'Cash value growth is on track compared to similar policyholders' },
    { ok: true,  text: 'This policy is well-suited to your current profile' },
  ],
  Medium: [
    { ok: false, text: 'Some people like you have found better-value alternatives recently' },
    { ok: false, text: 'Market conditions may have shifted since this policy was issued' },
    { ok: true,  text: 'Coverage level is appropriate for your income and dependent profile' },
  ],
  High: [
    { ok: false, text: 'This policy may not be meeting your long-term financial goals' },
    { ok: false, text: 'Many people like you have upgraded or restructured their coverage' },
    { ok: false, text: 'Premium efficiency has meaningful room for improvement' },
  ],
};

const NEXUS_VERDICT = {
  Low:    { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Looks like a keeper', detail: 'Based on your profile and current market conditions, this policy is working well for you. No urgent action required.' },
  Medium: { color: 'text-accent-amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Worth a second look', detail: 'A few signals suggest this policy could be optimised. It\'s not urgent, but reviewing your options now costs nothing.' },
  High:   { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Reconsider this policy', detail: 'Multiple signals indicate this policy may no longer be the best fit. Taking action soon could save money and improve coverage.' },
};

const NexusCard = ({ nexusData }) => {
  if (!nexusData) return (
    <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6 animate-pulse">
      <div className="h-4 w-48 bg-brand-navy rounded mb-4" />
      <div className="h-20 bg-brand-navy rounded" />
    </div>
  );

  const { lapse, recommendation } = nexusData;
  const signals = NEXUS_SIGNALS[lapse.risk_score] ?? NEXUS_SIGNALS.Medium;
  const verdict = NEXUS_VERDICT[lapse.risk_score] ?? NEXUS_VERDICT.Medium;

  // Replace "Peer cohort analysis" with "people like you" in the rationale
  const rationale = recommendation.rationale
    .replace(/Peer cohort analysis suggests/gi, 'People like you show')
    .replace(/peer cohort/gi, 'people like you');

  return (
    <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
      <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
        <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
          <BarChart2 size={12} className="text-blue-400" />
        </span>
        Should You Keep This Policy?
        <span className="ml-auto text-[10px] font-normal text-text-muted bg-brand-navy px-2 py-0.5 rounded-full border border-brand-slate-light">
          {lapse.source === 'nexus' ? '● Live' : '● Simulated'}
        </span>
      </h2>

      {/* Verdict banner */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border mb-4 ${verdict.bg} ${verdict.border}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${verdict.bg} border ${verdict.border}`}>
          {lapse.risk_score === 'Low'
            ? <CheckCircle size={18} className={verdict.color} />
            : lapse.risk_score === 'Medium'
            ? <Clock size={18} className={verdict.color} />
            : <AlertTriangle size={18} className={verdict.color} />}
        </div>
        <div>
          <p className={`font-bold text-sm ${verdict.color}`}>{verdict.label}</p>
          <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{verdict.detail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Signals */}
        <div className="p-4 bg-brand-navy rounded-xl border border-brand-slate-light">
          <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">Policy Signals</p>
          <div className="space-y-2.5">
            {signals.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                {s.ok
                  ? <CheckCircle size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle size={13} className="text-accent-amber flex-shrink-0 mt-0.5" />}
                <span className="text-xs text-text-secondary leading-snug">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What people like you are doing */}
        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
          <p className="text-xs text-text-muted uppercase font-semibold tracking-wider mb-3">What People Like You Are Doing</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400">
              {recommendation.policy_family === 'WL' ? 'Moving to Whole Life' : recommendation.policy_family}
            </span>
            <span className="px-2.5 py-1 bg-brand-slate border border-brand-slate-light rounded-full text-xs text-text-secondary">
              {recommendation.rec_face_band}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{rationale}</p>
        </div>
      </div>

      <p className="text-[10px] text-text-muted mt-3">
        Powered by <span className="font-semibold text-blue-400">Atidot Nexus</span> — portfolio intelligence for life insurance
      </p>
    </div>
  );
};

// ─── Report ───────────────────────────────────────────────────────────────────

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open: openChat } = useAIChat();
  const { policies } = usePolicies();
  const policy = policies.find((p) => p.id === id);

  const [expandedOpp, setExpandedOpp] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [nexusData, setNexusData] = useState(null);

  useEffect(() => {
    if (policy?.name) document.title = `${policy.name} — AnalyzeMyPolicy`;
    else document.title = 'Policy Not Found — AnalyzeMyPolicy';
  }, [policy?.name]);

  // Load Nexus analysis for this policy
  useEffect(() => {
    if (!policy) return;
    let cancelled = false;
    getNexusAnalysis(policy).then((data) => {
      if (!cancelled) setNexusData(data);
    });
    return () => { cancelled = true; };
  }, [policy]);

  const severityBadge = (severity) => {
    if (severity === 'high') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (severity === 'medium') return 'bg-amber-500/10 text-accent-amber border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  // Guard: no policy found (e.g. real user with no uploaded policies yet)
  if (!policy) {
    return (
      <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
        <AppNav variant="report" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <Shield size={40} className="text-text-muted" />
          <h2 className="text-white font-bold text-xl">No policy found</h2>
          <p className="text-text-secondary text-sm max-w-sm">
            This policy doesn't exist in your account yet. Upload a policy document to get started.
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate('/documents')}
              className="px-5 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
            >
              Upload a Policy
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="report" />

      {/* Policy hero */}
      <div className="bg-brand-slate border-b border-brand-slate-light">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-accent-amber transition-colors">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate('/dashboard')} className="hover:text-accent-amber transition-colors">Your Policies</button>
            <span>/</span>
            <span className="text-text-secondary font-medium truncate max-w-[180px]">{policy.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white text-base md:text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: policy.carrierColor }}
              >
                {policy.carrierInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-lg md:text-xl font-bold text-white">{policy.name}</h1>
                  <span className="px-2 py-0.5 bg-green-500/15 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                    Active
                  </span>
                </div>
                <p className="text-text-secondary text-sm">{policy.type} · {policy.carrier} · Issued {fmtDate(policy.issueDate)}</p>
                <p className="text-text-muted text-xs mt-1">Insured: {policy.insured} · Beneficiary: {policy.beneficiary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-2 px-3 py-2 border border-brand-slate-light hover:border-accent-amber/40 text-text-secondary hover:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Download size={14} /> Download Docs
              </button>
              <ScoreRing score={policy.score} size={90} />
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            {[
              { label: 'Death Benefit', value: fmt(policy.deathBenefit), icon: <Shield size={15} className="text-blue-400" /> },
              { label: 'Monthly Premium', value: `$${policy.premium}`, icon: <DollarSign size={15} className="text-accent-amber" /> },
              { label: 'Est. Cash Value', value: policy.cashValue > 0 ? fmt(policy.cashValue) : 'N/A', icon: <TrendingUp size={15} className="text-green-400" /> },
              { label: 'Next Payment', value: fmtDate(policy.nextPremiumDate), icon: <Calendar size={15} className="text-text-secondary" /> },
            ].map((m) => (
              <div key={m.label} className="bg-brand-navy rounded-xl p-3 md:p-4 border border-brand-slate-light">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase font-semibold tracking-wider mb-2">
                  {m.icon} {m.label}
                </div>
                <p className="text-white font-bold text-base md:text-lg">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-brand-slate-light sticky top-[60px] bg-brand-dark z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center">
          <span className="flex items-center gap-2 px-4 md:px-5 py-3.5 md:py-4 text-sm font-semibold border-b-2 border-accent-amber text-accent-amber">
            <Shield size={14} /> Analysis
          </span>
          <button
            onClick={openChat}
            className="ml-auto flex items-center gap-1.5 px-3 py-3.5 text-xs text-text-secondary hover:text-accent-amber transition-colors font-medium lg:hidden"
          >
            <Bot size={14} /> Ask AI
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">

          {/* Policy Summary */}
          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
            <h2 className="text-white font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
              <Info size={17} className="text-text-muted" /> Policy Summary
            </h2>
            <p className="text-text-secondary leading-relaxed text-sm">{policy.summary}</p>
          </div>

          {/* Policy Health Check */}
          {(() => {
            // Profile fit: simple three-dimension assessment
            const premiumRate = (policy.premium * 12) / policy.faceAmount * 1000; // per-mille
            const fitDimensions = [
              {
                label: 'Premium Efficiency',
                ok: premiumRate < 2.5,
                note: premiumRate < 1.5
                  ? 'Excellent value — very low cost per dollar of coverage'
                  : premiumRate < 2.5
                  ? 'Competitive — within typical market range'
                  : 'Higher than average — market alternatives worth checking',
              },
              {
                label: 'Coverage Level',
                ok: policy.faceAmount >= 500_000,
                note: policy.faceAmount >= 1_000_000
                  ? 'Substantial coverage — well-positioned for income protection'
                  : policy.faceAmount >= 500_000
                  ? 'Adequate for most income replacement scenarios'
                  : 'May be below recommended levels for your income profile',
              },
              {
                label: 'Policy Type Fit',
                ok: true,
                note: policy.type === 'Whole Life'
                  ? 'Permanent coverage — ideal for long-term wealth and estate planning'
                  : policy.type === 'Term Life'
                  ? 'Term coverage — right tool for income replacement during earning years'
                  : 'Flexible coverage type suited to your profile',
              },
            ];
            const fitScore = Math.round(
              (policy.score * 0.5) +
              (fitDimensions.filter(d => d.ok).length / fitDimensions.length) * 50
            );
            const fitLabel = fitScore >= 80 ? 'Strong Fit' : fitScore >= 65 ? 'Good Fit' : 'Moderate Fit';
            const fitColor = fitScore >= 80 ? 'text-green-400' : fitScore >= 65 ? 'text-accent-amber' : 'text-red-400';

            return (
              <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
                <h2 className="text-white font-bold mb-4 md:mb-5 flex items-center gap-2 text-sm md:text-base">
                  <Shield size={17} className="text-text-muted" /> Policy Health Check
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  {/* What's working */}
                  <div className="md:col-span-1 p-4 bg-green-500/5 border border-green-500/15 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp size={13} className="text-green-400" />
                      <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">What's Working</p>
                    </div>
                    <ul className="space-y-2">
                      {policy.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary leading-snug">
                          <CheckCircle size={11} className="text-green-400 flex-shrink-0 mt-0.5" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  <div className="md:col-span-1 p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown size={13} className="text-accent-amber" />
                      <p className="text-xs font-semibold text-accent-amber uppercase tracking-wider">Concerns</p>
                    </div>
                    <ul className="space-y-2">
                      {policy.opportunities.slice(0, 3).map((o) => (
                        <li key={o.id} className="flex items-start gap-2 text-xs text-text-secondary leading-snug">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                            o.severity === 'high' ? 'bg-red-400' : o.severity === 'medium' ? 'bg-accent-amber' : 'bg-blue-400'
                          }`} />
                          {o.title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Profile fit */}
                  <div className="md:col-span-1 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart2 size={13} className="text-blue-400" />
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Profile Fit</p>
                    </div>
                    <p className={`text-2xl font-bold mb-1 ${fitColor}`}>{fitLabel}</p>
                    <div className="space-y-1.5 mt-2">
                      {fitDimensions.map((d) => (
                        <div key={d.label} className="flex items-center gap-1.5">
                          {d.ok
                            ? <CheckCircle size={11} className="text-green-400 flex-shrink-0" />
                            : <AlertTriangle size={11} className="text-accent-amber flex-shrink-0" />}
                          <span className="text-[11px] text-text-muted">{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fit dimension detail */}
                <div className="border-t border-brand-slate-light pt-4 space-y-2">
                  {fitDimensions.map((d) => (
                    <div key={d.label} className="flex items-start gap-2 text-xs text-text-secondary">
                      {d.ok
                        ? <CheckCircle size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
                        : <AlertTriangle size={12} className="text-accent-amber flex-shrink-0 mt-0.5" />}
                      <span><span className="text-white font-semibold">{d.label}:</span> {d.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Atidot Nexus Intelligence */}
          <NexusCard nexusData={nexusData} />

          {/* Opportunities — AMP button visible per row */}
          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
            <h2 className="text-white font-bold mb-4 md:mb-5 flex items-center gap-2 text-sm md:text-base">
              <Zap size={17} className="text-text-muted" /> Opportunities to Improve
            </h2>
            <div className="space-y-3">
              {policy.opportunities.map((opp) => {
                const isOpen = expandedOpp === opp.id;
                return (
                  <div key={opp.id} className="border border-brand-slate-light rounded-xl overflow-hidden">
                    {/* Row header — expand toggle + AMP button */}
                    <div className="flex items-center gap-3 p-4 hover:bg-brand-navy/50 transition-colors">
                      <button
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                        onClick={() => setExpandedOpp(isOpen ? null : opp.id)}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex-shrink-0 ${severityBadge(opp.severity)}`}
                        >
                          {opp.severity}
                        </span>
                        <span className="text-white font-semibold text-sm truncate">{opp.title}</span>
                      </button>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent-amber/10 hover:bg-accent-amber/20 text-accent-amber border border-accent-amber/25 text-xs font-bold rounded-lg transition-colors"
                          onClick={(e) => { e.stopPropagation(); setShowAgentModal(true); }}
                          title="Let AMP Handle It"
                        >
                          <Sparkles size={11} />
                          <span className="hidden sm:inline">Let AMP Handle It</span>
                        </button>
                        <button
                          onClick={() => setExpandedOpp(isOpen ? null : opp.id)}
                          className="text-text-muted hover:text-white transition-colors"
                        >
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-4 pb-5 border-t border-brand-slate-light bg-brand-navy/30">
                        <p className="text-text-secondary text-sm mt-4 leading-relaxed">{opp.description}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {opp.cta && (
                            <button
                              className="flex items-center gap-1.5 px-4 py-2 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-xs font-bold rounded-lg transition-colors"
                              onClick={() => {
                                if (opp.cta === 'Compare Rates Now' || opp.cta === 'Get a Better Quote') {
                                  window.open('https://www.policygenius.com/?utm_source=analyzemypolicy', '_blank', 'noopener');
                                } else if (opp.cta === 'Get Conversion Quote') {
                                  setShowAgentModal(true);
                                } else {
                                  openChat();
                                }
                              }}
                            >
                              {opp.cta}
                            </button>
                          )}
                          <button
                            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-brand-slate-light hover:border-accent-amber/40 text-text-secondary hover:text-white text-xs font-semibold rounded-lg transition-colors"
                            onClick={() => setShowEmailModal(true)}
                          >
                            <Mail size={13} /> Send to Advisor
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policy Timeline */}
          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
            <h2 className="text-white font-bold mb-5 md:mb-6 flex items-center gap-2 text-sm md:text-base">
              <Calendar size={17} className="text-text-muted" /> Policy Timeline
            </h2>
            <div className="relative pl-4">
              <div className="absolute left-4 top-3 bottom-3 w-[2px] bg-brand-slate-light" />
              <div className="space-y-5 md:space-y-6">
                {policy.milestones.map((ms) => {
                  const s = milestoneStyle(ms.type, ms.isPast);
                  return (
                    <div key={ms.id} className="relative flex items-start gap-5">
                      <div
                        className={`absolute -left-[3px] w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${s.dot} ${ms.isPast ? 'opacity-40' : ''}`}
                      />
                      <div className="pl-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${ms.isPast ? 'text-text-muted' : 'text-white'}`}>
                            {ms.label}
                          </span>
                          {ms.isUrgent && !ms.isPast && (
                            <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-xs mt-0.5">{fmtDate(ms.date)}</p>
                        <p className="text-text-secondary text-sm mt-1 leading-relaxed">{ms.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom CTA — replaces sticky footer */}
          <div className="bg-brand-slate border border-brand-slate-light rounded-xl p-5 md:p-6">
            <h2 className="text-white font-bold mb-1 text-sm md:text-base flex items-center gap-2">
              <Mail size={16} className="text-text-muted" /> Share This Analysis
            </h2>
            <p className="text-text-secondary text-sm mb-4">
              Send a full copy of this report — including score breakdown, Nexus intelligence, and opportunities — directly to your advisor.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark border border-brand-slate-light hover:border-accent-amber/40 text-white font-semibold rounded-lg text-sm transition-colors"
                onClick={() => setShowEmailModal(true)}
              >
                <Mail size={15} /> Send Report to Advisor
              </button>
              <button
                className="flex items-center justify-center gap-2 px-5 py-3 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
                onClick={() => setShowAgentModal(true)}
              >
                <Sparkles size={15} /> Let AnalyzeMyPolicy Handle It
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      {showEmailModal && (
        <SendReportModal policy={policy} user={user} onClose={() => setShowEmailModal(false)} />
      )}
      {showAgentModal && (
        <AgentModal policy={policy} onClose={() => setShowAgentModal(false)} />
      )}
      {showDownloadModal && (
        <DownloadDocsModal policy={policy} onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
};

export default Report;
