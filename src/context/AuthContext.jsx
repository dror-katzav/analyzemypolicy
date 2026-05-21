import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('amp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    if (!email || !password) return { ok: false, error: 'Email and password required.' };
    const firstName = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'User';
    const u = { email, firstName: capitalise(firstName), lastName: '' };
    persist(u);
    return { ok: true };
  };

  const googleLogin = (profile) => {
    const u = {
      email: profile.email,
      firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      picture: profile.picture || null,
      isGoogle: true,
    };
    persist(u);
  };

  const signup = (firstName, lastName, email, password) => {
    if (!firstName || !email || !password)
      return { ok: false, error: 'Please fill in all required fields.' };
    if (password.length < 8)
      return { ok: false, error: 'Password must be at least 8 characters.' };
    const u = { email, firstName, lastName };
    persist(u);
    return { ok: true };
  };

  const loginAsGuest = () => {
    const u = { email: 'guest@demo.analyzemypolicy.com', firstName: 'Guest', lastName: '', isGuest: true };
    persist(u);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    persist(updated);
  };

  const deleteAccount = () => {
    // Clear all user-scoped data
    if (user?.email) {
      ['amp_policies_v2_', 'amp_chat_v2_', 'amp_docs_v1_', 'amp_score_history_v1_', 'amp_onboarding_'].forEach((prefix) => {
        localStorage.removeItem(prefix + user.email);
      });
    }
    setUser(null);
    localStorage.removeItem('amp_user');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('amp_user');
  };

  const persist = (u) => {
    setUser(u);
    localStorage.setItem('amp_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, signup, loginAsGuest, logout, updateUser, deleteAccount, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const useAuth = () => useContext(AuthContext);
