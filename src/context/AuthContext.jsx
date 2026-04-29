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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('amp_user');
  };

  const persist = (u) => {
    setUser(u);
    localStorage.setItem('amp_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginAsGuest, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const useAuth = () => useContext(AuthContext);
