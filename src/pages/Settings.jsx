import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Moon, Sun, Trash2, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import AppNav from '../components/AppNav';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, deleteAccount } = useAuth();
  const { isDark, toggle } = useTheme();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    updateUser({ firstName: firstName.trim(), lastName: lastName.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-dark font-sans text-text-primary flex flex-col">
      <AppNav variant="dashboard" />

      <div className="px-6 md:px-8 py-8 border-b border-brand-slate-light">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your profile and account preferences.</p>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-8 py-8 max-w-2xl mx-auto w-full space-y-6">

        {/* Profile */}
        <section className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-text-muted" />
            <h2 className="text-white font-bold">Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-navy border border-brand-slate-light rounded-lg text-sm text-white outline-none focus:border-accent-amber/60 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-navy border border-brand-slate-light rounded-lg text-sm text-white outline-none focus:border-accent-amber/60 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-3 py-2.5 bg-brand-navy border border-brand-slate-light rounded-lg text-sm text-text-muted outline-none cursor-not-allowed"
              />
              <p className="text-[11px] text-text-muted mt-1">Email cannot be changed.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent-amber hover:bg-accent-amber-hover text-brand-dark font-bold rounded-lg text-sm transition-colors"
              >
                Save Profile
              </button>
              {profileSaved && (
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                  <CheckCircle size={15} /> Saved
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Appearance */}
        <section className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            {isDark ? <Moon size={16} className="text-text-muted" /> : <Sun size={16} className="text-text-muted" />}
            <h2 className="text-white font-bold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-text-muted text-xs mt-0.5">
                {isDark ? 'Currently using dark theme.' : 'Currently using light theme.'}
              </p>
            </div>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-brand-slate-light' : 'bg-accent-amber'}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDark ? 'left-1' : 'left-7'}`}
              />
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-brand-slate border border-brand-slate-light rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={16} className="text-text-muted" />
            <h2 className="text-white font-bold">Security &amp; Privacy</h2>
          </div>
          <button
            onClick={() => navigate('/security')}
            className="w-full flex items-center justify-between p-3 bg-brand-navy rounded-lg border border-brand-slate-light hover:border-accent-amber/40 transition-colors text-left"
          >
            <div>
              <p className="text-white text-sm font-semibold">Privacy &amp; Security Policy</p>
              <p className="text-text-muted text-xs mt-0.5">AES-256 encryption · TLS 1.3 · SOC 2 Type II</p>
            </div>
            <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-brand-slate border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-white font-bold">Danger Zone</h2>
          </div>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">Delete Account</p>
                <p className="text-text-muted text-xs mt-0.5">
                  Permanently removes all your policies, documents, and chat history.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-shrink-0 ml-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-lg text-sm font-bold transition-colors"
              >
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-red-400 text-sm font-semibold">
                Type <strong>DELETE</strong> to confirm permanent account deletion.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2.5 bg-brand-navy border border-red-500/30 rounded-lg text-sm text-white outline-none focus:border-red-500/60 transition-colors"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                  className="flex-1 py-2.5 border border-brand-slate-light text-text-secondary hover:text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'DELETE'}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
