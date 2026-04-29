import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Plus, LogOut, Sun, Moon, MessageCircle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAIChat } from '../context/AIChatContext';

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
  const { toggle: toggleChat } = useAIChat();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
    : 'G';

  return (
    <>
      <nav className="h-[60px] flex items-center justify-between px-4 md:px-8 bg-brand-slate border-b border-brand-slate-light flex-shrink-0 sticky top-0 z-40">
        {/* Logo */}
        <div
          className="flex items-center gap-2 font-bold text-white cursor-pointer flex-shrink-0"
          onClick={() => navigate('/dashboard')}
        >
          <Shield size={22} className="text-accent-gold flex-shrink-0" />
          <span className="text-base tracking-tight hidden sm:inline">AnalyzeMyPolicy</span>
        </div>

        {/* Center nav — desktop */}
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
        <div className="flex items-center gap-1.5">
          {/* Add Policy — desktop only */}
          {variant === 'dashboard' && (
            <button
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark text-sm font-bold rounded-lg transition-colors"
              onClick={() => navigate('/analyze')}
            >
              <Plus size={15} /> Add Policy
            </button>
          )}

          {/* AI Chat toggle — mobile only (desktop has permanent sidebar) */}
          <button
            onClick={toggleChat}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors text-xs font-semibold"
            title="Ask AI"
          >
            <MessageCircle size={17} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User avatar + logout — desktop */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-brand-slate-light">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent-amber flex items-center justify-center text-brand-dark font-bold text-xs flex-shrink-0">
                {initials}
              </div>
            )}
            <span className="text-sm text-text-secondary max-w-[110px] truncate">
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-slate-light/40 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-slate border-b border-brand-slate-light z-30 sticky top-[60px]">
          {/* Nav links */}
          {variant === 'dashboard' && (
            <div className="px-4 py-2 border-b border-brand-slate-light space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    location.pathname === link.path
                      ? 'bg-accent-amber/10 text-accent-amber'
                      : 'text-text-secondary hover:text-white hover:bg-brand-slate-light/40'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => { navigate('/analyze'); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-accent-amber hover:bg-accent-amber/10 transition-colors"
              >
                <Plus size={15} /> Add Policy
              </button>
            </div>
          )}

          {/* User row */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img src={user.picture} alt={user.firstName} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent-amber flex items-center justify-center text-brand-dark font-bold text-sm">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-white text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-text-muted text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-text-muted hover:text-white text-xs transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppNav;
