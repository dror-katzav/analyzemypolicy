import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Field = ({ label, type = 'text', placeholder, value, onChange, error, showToggle, onToggle }) => (
  <div>
    {label && (
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3.5 border rounded-lg outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all bg-white text-slate-900 placeholder-slate-400 text-sm ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onToggle}
        >
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
    {error && (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const { login, signup, loginAsGuest } = useAuth();
  const { isDark, toggle } = useTheme();

  const [authMode, setAuthMode] = useState('none');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  const [suFirst, setSuFirst] = useState('');
  const [suLast, setSuLast] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    await delay(400);
    const result = login(siEmail, siPassword);
    setLoading(false);
    if (result.ok) navigate('/dashboard');
    else setError(result.error);
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    await delay(400);
    const result = signup(suFirst, suLast, suEmail, suPassword);
    setLoading(false);
    if (result.ok) navigate('/dashboard');
    else setError(result.error);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await delay(600);
    login('demo@gmail.com', 'google-oauth');
    setLoading(false);
    navigate('/dashboard');
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  const back = () => {
    setAuthMode('none');
    setError('');
    setShowPw(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-sans">

      {/* Left Panel — always dark */}
      <div className="flex-1 bg-brand-dark p-8 md:p-14 flex flex-col justify-between min-h-[320px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={30} className="text-accent-gold" />
            <span className="text-white text-xl font-bold tracking-tight">AnalyzeMyPolicy</span>
          </div>
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-brand-slate flex items-center justify-center text-text-secondary hover:text-white transition-colors"
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        <div className="max-w-[520px] py-12 md:py-0">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            <span className="text-white">Your Policy.</span><br />
            <span className="text-accent-amber">Your Legacy.</span><br />
            <span className="text-white">Protected.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            Institutional-grade life insurance monitoring for families who demand clarity and confidence.
          </p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[['98%', 'Satisfaction'], ['$2B+', 'Analyzed'], ['12k+', 'Families']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="text-text-muted text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-slate rounded-full border border-brand-slate-light text-text-secondary text-xs">
            🔒 Bank-grade encryption · SOC 2 · Private &amp; confidential
          </div>
        </div>
      </div>

      {/* Right Panel — always white, hardcoded slate classes only */}
      <div className="flex-1 bg-white p-8 md:p-14 flex items-center justify-center">
        <div className="w-full max-w-[420px]">

          {/* ── Home / Choose ── */}
          {authMode === 'none' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-8">Access your policy dashboard or start a new analysis.</p>

              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300 text-sm shadow-sm mb-3 disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center my-5">
                <div className="flex-1 border-b border-slate-200" />
                <span className="px-4 text-slate-400 text-xs">or use email</span>
                <div className="flex-1 border-b border-slate-200" />
              </div>

              <button
                className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors text-sm"
                onClick={() => setAuthMode('signin')}
              >
                Sign In to My Account
              </button>
              <button
                className="w-full mt-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-lg transition-colors border border-slate-200 text-sm"
                onClick={() => setAuthMode('create')}
              >
                Create an Account →
              </button>

              <div className="flex items-center my-6">
                <div className="flex-1 border-b border-slate-200" />
                <span className="px-4 text-slate-400 text-xs">or</span>
                <div className="flex-1 border-b border-slate-200" />
              </div>

              <div
                className="flex justify-between items-center p-5 border border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
                onClick={handleGuest}
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-0.5">
                    Continue as Guest
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">Demo</span>
                  </h3>
                  <p className="text-slate-500 text-xs">Explore a full demo dashboard. No data saved.</p>
                </div>
                <span className="text-xl text-slate-400">→</span>
              </div>

              <p className="text-center mt-8 text-xs text-slate-400">
                Protected by 256-bit encryption. We never sell your data.
              </p>
            </div>
          )}

          {/* ── Sign In ── */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn}>
              <button type="button" className="text-slate-400 text-xs mb-6 hover:text-slate-700 transition-colors" onClick={back}>
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
              <p className="text-slate-500 text-sm mb-7">Sign in to access your policy dashboard.</p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300 text-sm shadow-sm mb-5 disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center mb-5">
                <div className="flex-1 border-b border-slate-200" />
                <span className="px-4 text-slate-400 text-xs">or email</span>
                <div className="flex-1 border-b border-slate-200" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="space-y-4 mb-5">
                <Field
                  type="email"
                  placeholder="you@example.com"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                />
                <Field
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={siPassword}
                  onChange={(e) => setSiPassword(e.target.value)}
                  showToggle
                  onToggle={() => setShowPw((v) => !v)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors text-sm disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p className="text-center mt-5 text-slate-400 text-xs">
                Don&apos;t have an account?{' '}
                <span
                  className="text-amber-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => { setAuthMode('create'); setError(''); }}
                >
                  Sign up
                </span>
              </p>
            </form>
          )}

          {/* ── Create Account ── */}
          {authMode === 'create' && (
            <form onSubmit={handleSignUp}>
              <button type="button" className="text-slate-400 text-xs mb-6 hover:text-slate-700 transition-colors" onClick={back}>
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
              <p className="text-slate-500 text-sm mb-7">Start monitoring your family's policy health.</p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors border border-slate-300 text-sm shadow-sm mb-5 disabled:opacity-60"
              >
                <GoogleIcon />
                Sign up with Google
              </button>

              <div className="flex items-center mb-5">
                <div className="flex-1 border-b border-slate-200" />
                <span className="px-4 text-slate-400 text-xs">or use email</span>
                <div className="flex-1 border-b border-slate-200" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="space-y-3 mb-5">
                <div className="flex gap-3">
                  <Field
                    placeholder="First name *"
                    value={suFirst}
                    onChange={(e) => setSuFirst(e.target.value)}
                  />
                  <Field
                    placeholder="Last name"
                    value={suLast}
                    onChange={(e) => setSuLast(e.target.value)}
                  />
                </div>
                <Field
                  type="email"
                  placeholder="Email address *"
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                />
                <Field
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password (min 8 characters) *"
                  value={suPassword}
                  onChange={(e) => setSuPassword(e.target.value)}
                  showToggle
                  onToggle={() => setShowPw((v) => !v)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors text-sm disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-center mt-5 text-slate-400 text-xs">
                Already have an account?{' '}
                <span
                  className="text-amber-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => { setAuthMode('signin'); setError(''); }}
                >
                  Sign in
                </span>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default Landing;
