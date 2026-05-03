import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, CheckCircle, Clock, AlertCircle,
  Trash2, ExternalLink, ChevronRight, X,
} from 'lucide-react';
import AppNav from '../components/AppNav';
import { parsePolicy } from '../utils/policyParser';

const INITIAL_DOCS = [
  {
    id: 'doc-001',
    name: 'MetLife_Policy_Contract.pdf',
    fileType: 'pdf',
    size: '2.4 MB',
    uploadDate: '2026-04-15',
    status: 'analyzed',
    policyName: 'MetLife Whole Life',
    policyId: 'pol-001',
    extracted: { type: 'Whole Life', carrier: 'MetLife', faceAmount: 1500000, premium: 580 },
  },
  {
    id: 'doc-002',
    name: 'Protective_Term_Illustration.pdf',
    fileType: 'pdf',
    size: '1.1 MB',
    uploadDate: '2026-04-20',
    status: 'analyzed',
    policyName: 'Protective 20-Year Term',
    policyId: 'pol-002',
    extracted: { type: 'Term Life', carrier: 'Protective Life', faceAmount: 500000, premium: 267 },
  },
];

const STEPS = [
  'Reading document…',
  'Identifying policy type and carrier…',
  'Extracting coverage details…',
  'Analyzing premium structure…',
  'Building your policy profile…',
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmt = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

function DeleteConfirmModal({ doc, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-slate border border-brand-slate-light rounded-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Remove document?</h3>
          <p className="text-text-secondary text-sm">
            <span className="text-white font-semibold">{doc.name}</span> will be removed from your library.
            This does not delete the associated policy from your dashboard.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(null); // { name, step, progress }
  const [parseError, setParseError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // doc to confirm deletion

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    setParseError(null);

    const tempId = 'doc-' + Date.now();
    const pending = {
      id: tempId,
      name: file.name,
      fileType: file.name.split('.').pop().toLowerCase(),
      size: formatBytes(file.size),
      uploadDate: new Date().toISOString().slice(0, 10),
      status: 'processing',
      policyName: null,
      policyId: null,
      extracted: null,
    };

    setDocs((prev) => [pending, ...prev]);

    // Animate steps while parsing
    let step = 0;
    setProcessing({ id: tempId, step: 0 });
    const ticker = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1);
      setProcessing({ id: tempId, step });
    }, 550);

    try {
      const extracted = await parsePolicy(file);
      clearInterval(ticker);
      setProcessing(null);

      const policyName = [extracted.carrier, extracted.policyType]
        .filter(Boolean)
        .join(' ') || file.name.replace(/\.[^.]+$/, '');

      setDocs((prev) =>
        prev.map((d) =>
          d.id === tempId
            ? { ...d, status: 'analyzed', policyName, extracted }
            : d
        )
      );
    } catch (err) {
      clearInterval(ticker);
      setProcessing(null);
      setParseError('Could not parse this document. Please try a PDF or image of your policy.');
      setDocs((prev) => prev.map((d) => (d.id === tempId ? { ...d, status: 'error' } : d)));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeDoc = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setDeleteConfirm(null);
  };

  const statusBadge = (status) => {
    if (status === 'analyzed')
      return <span className="flex items-center gap-1 text-[11px] font-bold text-green-400"><CheckCircle size={11} /> Analyzed</span>;
    if (status === 'processing')
      return <span className="flex items-center gap-1 text-[11px] font-bold text-accent-amber"><Clock size={11} className="animate-spin" /> Processing…</span>;
    return <span className="flex items-center gap-1 text-[11px] font-bold text-red-400"><AlertCircle size={11} /> Error</span>;
  };

  const analyzedCount = docs.filter((d) => d.status === 'analyzed').length;

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="dashboard" />

      {/* Header */}
      <div className="px-6 md:px-8 py-8 border-b border-brand-slate-light">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-white">Documents</h1>
            <p className="text-text-secondary text-sm mt-1">
              {analyzedCount} document{analyzedCount !== 1 ? 's' : ''} analyzed · Upload to add a new policy
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold text-sm rounded-lg transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} /> Upload Document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      <div className="flex-1 px-6 md:px-8 py-8 max-w-5xl mx-auto w-full space-y-6">

        {/* Parse error */}
        {parseError && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{parseError}</span>
            <button onClick={() => setParseError(null)}><X size={14} /></button>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dragging
              ? 'border-accent-amber bg-accent-amber/5'
              : 'border-brand-slate-light hover:border-accent-amber/50 hover:bg-brand-slate/40'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-accent-amber/10 flex items-center justify-center">
            <Upload size={22} className="text-accent-amber" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              Drop your policy document here
            </p>
            <p className="text-text-muted text-xs mt-1">
              PDF, JPEG, PNG, Word — policy contracts, illustrations, statements
            </p>
          </div>
          <span className="px-4 py-1.5 bg-brand-slate border border-brand-slate-light rounded-full text-xs text-text-secondary font-medium">
            or click to browse
          </span>
        </div>

        {/* Document list */}
        {docs.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">Your Documents</h2>

            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-brand-slate border border-brand-slate-light rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-text-secondary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm truncate">{doc.name}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-brand-slate-light rounded text-text-muted">
                        {doc.fileType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {statusBadge(doc.status)}
                      <span className="text-xs text-text-muted">{doc.size}</span>
                      <span className="text-xs text-text-muted">{fmtDate(doc.uploadDate)}</span>
                    </div>

                    {/* Processing steps */}
                    {doc.status === 'processing' && processing?.id === doc.id && (
                      <div className="mt-3">
                        <div className="flex gap-1 mb-2">
                          {STEPS.map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-1 rounded-full transition-colors duration-500 ${
                                i <= processing.step ? 'bg-accent-amber' : 'bg-brand-slate-light'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-text-muted">{STEPS[processing.step]}</p>
                      </div>
                    )}

                    {/* Extracted data preview */}
                    {doc.status === 'analyzed' && doc.extracted && (
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-xs text-text-secondary font-medium">
                          {doc.policyName}
                        </span>
                        {doc.extracted.faceAmount && (
                          <span className="text-xs text-text-muted">
                            Coverage: <span className="text-white font-semibold">{fmt(doc.extracted.faceAmount)}</span>
                          </span>
                        )}
                        {doc.extracted.premium && (
                          <span className="text-xs text-text-muted">
                            Premium: <span className="text-white font-semibold">${doc.extracted.premium}/mo</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.status === 'analyzed' && doc.policyId && (
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-accent-amber border border-accent-amber/30 rounded-lg hover:bg-accent-amber/10 transition-colors"
                        onClick={() => navigate(`/report/${doc.policyId}`)}
                      >
                        View Analysis <ChevronRight size={12} />
                      </button>
                    )}
                    <button
                      className="p-2 text-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      onClick={() => setDeleteConfirm(doc)}
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security note */}
        <div className="flex items-start gap-3 p-4 bg-brand-slate border border-brand-slate-light rounded-xl text-xs text-text-muted">
          <span className="text-lg leading-none">🔒</span>
          <p>
            Your documents are encrypted at rest using AES-256 and transmitted over TLS 1.3.
            We never share your documents with third parties. Documents are processed for analysis purposes only.
          </p>
        </div>

      </div>

      {deleteConfirm && (
        <DeleteConfirmModal
          doc={deleteConfirm}
          onConfirm={() => removeDoc(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
