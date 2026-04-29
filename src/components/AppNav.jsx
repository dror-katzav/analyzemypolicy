import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Plus, LogOut, Sun, Moon, FileText, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Portfolio', path: '/dashboard' },
  { label: 'Documents', path: '/documents' },
  { label: 'Advisor', path: '/advisor' },
];

const AppNav = ({ variant = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : 'G';

  return (
    <nav className="h-[64px] flex items-center justify-between px-6 md:px-8 bg-brand-slate border-b border-brand-slate-light flex-shrink-0 sticky top-0 z-40">
      {/* Logo */}
      <div
        className="flex items-center gap-2 font-bold text-white cursor-pointer flex-shrink-0"
        onClick={() => navigate('/dashboard')}
      >
        <Shield size={22} className="text-accent-gold flex-shrink-0" />
        <span className="text-base tracking-tight hidden sm:inline">AnalyzeMyPolicy</span>
      </div>

      {/* Center nav (authenticated, dashboard variant) */}
      {variant === 'dashboard' && (
        <div className="hidden md:flex items-center gap-1 mx-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === link.path
                  ? 'bg-accent-amber/10 text-accent-amber'
                  : 'text-text-secondary hover:text-white hover:bg-brand-slate-light/40'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      {/* Report back button */}
      {variant === 'report' && (
        <button
          className="flex items-center gap-1 text-text-secondary hover:text-white text-sm transition-colors mx-4"
          onClick={() => navigate('/dashboard')}
        >
          ← Portfolio
        </button>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Add Policy */}
        {variant === 'dashboard' && (
          <button
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-sm font-bold rounded-lg transition-colors"
            onClick={() => navigate('/analyze')}
          >
            <Plus size={15} /> Add Policy
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-brand-slate-light">
          <div className="w-8 h-8 rounded-full bg-accent-amber flex items-center justify-center text-brand-dark font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          <span className="hidden lg:inline text-sm text-text-secondary max-w-[120px] truncate">
            {user?.firstName ?? 'Guest'}
          </span>
          <button
            className="text-text-muted hover:text-white transition-colors p-1"
            title="Sign out"
            onClick={handleLogout}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
