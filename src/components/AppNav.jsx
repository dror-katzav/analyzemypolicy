import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { MOCK_USER } from '../data/mockData';

const AppNav = ({ variant = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="h-[64px] flex items-center justify-between px-6 md:px-8 bg-brand-slate border-b border-brand-slate-light flex-shrink-0 sticky top-0 z-40">
      {/* Left: Logo */}
      <div
        className="flex items-center gap-2 font-bold text-white cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <Shield size={24} className="text-accent-gold" />
        <span className="text-lg tracking-tight">AnalyzeMyPolicy</span>
      </div>

      {/* Center: Nav links (dashboard only) */}
      {variant === 'dashboard' && (
        <div className="hidden md:flex items-center gap-6">
          <span
            className={`text-sm font-semibold cursor-pointer transition-colors ${
              location.pathname === '/dashboard'
                ? 'text-accent-amber'
                : 'text-text-secondary hover:text-white'
            }`}
            onClick={() => navigate('/dashboard')}
          >
            Portfolio
          </span>
          <span className="text-sm font-semibold text-text-muted cursor-default">
            Documents
          </span>
          <span className="text-sm font-semibold text-text-muted cursor-default">
            Advisor
          </span>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-3">
        {variant === 'dashboard' && (
          <button
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-sm font-bold rounded-lg transition-colors"
            onClick={() => navigate('/analyze')}
          >
            <Plus size={16} /> Add Policy
          </button>
        )}

        {variant === 'report' && (
          <button
            className="flex items-center gap-2 text-text-secondary hover:text-white text-sm transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Portfolio
          </button>
        )}

        <div className="flex items-center gap-2 pl-3 border-l border-brand-slate-light">
          <div className="w-8 h-8 rounded-full bg-accent-amber flex items-center justify-center text-brand-dark font-bold text-sm">
            {MOCK_USER.firstName[0]}
          </div>
          <span className="hidden md:inline text-sm text-text-secondary">
            {MOCK_USER.firstName}
          </span>
          <button
            className="text-text-muted hover:text-white transition-colors ml-1"
            title="Sign out"
            onClick={() => navigate('/')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
