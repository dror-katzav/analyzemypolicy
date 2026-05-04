import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent-amber/10 flex items-center justify-center mb-6">
        <Shield size={30} className="text-accent-amber" />
      </div>

      <p className="text-accent-amber text-sm font-bold uppercase tracking-widest mb-3">404</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Page not found</h1>
      <p className="text-text-secondary text-base max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={15} /> Go back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark rounded-lg text-sm font-bold transition-colors"
        >
          <Home size={15} /> Dashboard
        </button>
      </div>
    </div>
  );
}
