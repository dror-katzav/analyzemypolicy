/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MOCK_POLICIES, PORTFOLIO_CASH_VALUE } from '../data/mockData';
import { useAuth } from './AuthContext';

const PoliciesContext = createContext();

// ─── Storage helpers ──────────────────────────────────────────────────────────

/** Return the localStorage key for a given user (null = guest/unauthenticated → demo data) */
const storageKeyFor = (user) =>
  user && !user.isGuest ? `amp_policies_v2_${user.email}` : null;

const loadFromStorage = (key) => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];   // real users start with empty list
  } catch {
    return [];
  }
};

const saveToStorage = (key, policies) => {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(policies));
  } catch { /* quota exceeded — silently ignore */ }
};

// ─── Portfolio score ──────────────────────────────────────────────────────────

const computePortfolioScore = (policies) => {
  if (!policies.length) return 100;
  let deductions = 0;
  policies.forEach((p) => {
    (p.opportunities ?? []).forEach((o) => {
      if (o.severity === 'high') deductions += 8;
      else if (o.severity === 'medium') deductions += 4;
      else if (o.severity === 'low') deductions += 1;
    });
  });
  return Math.max(40, 100 - deductions);
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const PoliciesProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user);

  // Initialize: real users get their own data (empty on first login), guests get demo policies
  const [policies, setPolicies] = useState(() => {
    return loadFromStorage(storageKey) ?? MOCK_POLICIES;
  });

  // Reload whenever the logged-in user changes (login / logout / switch account)
  // Standard React pattern: adjusting state directly during render when prop/context dependency changes
  const [prevStorageKey, setPrevStorageKey] = useState(storageKey);
  if (storageKey !== prevStorageKey) {
    setPrevStorageKey(storageKey);
    setPolicies(storageKey ? (loadFromStorage(storageKey) ?? []) : MOCK_POLICIES);
  }

  const addPolicy = useCallback((policy) => {
    setPolicies((prev) => {
      const next = [policy, ...prev];
      saveToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const removePolicy = useCallback((id) => {
    setPolicies((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const updatePolicy = useCallback((id, updates) => {
    setPolicies((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  // ─── Computed values ──────────────────────────────────────────────────────

  const portfolioScore = useMemo(() => computePortfolioScore(policies), [policies]);

  const totalCoverage = useMemo(
    () => policies.reduce((sum, p) => sum + (p.faceAmount ?? 0), 0),
    [policies]
  );

  const totalMonthlyPremium = useMemo(
    () => policies.reduce((sum, p) => sum + (p.premium ?? 0), 0),
    [policies]
  );

  const estimatedCashValue = useMemo(
    () => policies.reduce((sum, p) => sum + (p.cashValue ?? 0), 0),
    [policies]
  );

  // Upcoming events built from policy milestone data
  const upcomingEvents = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const events = [];
    policies.forEach((p) => {
      (p.milestones ?? [])
        .filter((m) => !m.isPast)
        .forEach((m) => {
          const d = new Date(m.date); d.setHours(0, 0, 0, 0);
          const days = Math.round((d - today) / 86400000);
          if (days >= 0 && days <= 1461) {
            events.push({
              id: m.id,
              date: m.date,
              daysAway: days,
              urgency: m.isUrgent
                ? 'critical'
                : m.type === 'premium'
                ? 'high'
                : m.type === 'warning' || m.type === 'critical'
                ? 'high'
                : 'medium',
              label: m.label,
              detail: `${p.shortName} — ${m.detail}`,
              policyId: p.id,
            });
          }
        });
    });
    return events.sort((a, b) => a.daysAway - b.daysAway).slice(0, 4);
  }, [policies]);

  // Next upcoming premium
  const nextPremium = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const premiumMilestones = policies
      .flatMap((p) =>
        (p.milestones ?? [])
          .filter((m) => m.type === 'premium' && !m.isPast)
          .map((m) => ({ ...m, premium: p.premium, policyName: p.shortName, policyId: p.id }))
      )
      .filter((m) => {
        const d = new Date(m.date); d.setHours(0, 0, 0, 0);
        return d >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (!premiumMilestones.length) return null;
    const next = premiumMilestones[0];
    return { date: next.date, amount: next.premium, policyName: next.policyName, policyId: next.policyId };
  }, [policies]);

  // Cash value history: use the first policy's series, or the portfolio-level constant
  const cashValueHistory = useMemo(() => {
    const withSeries = policies.find((p) => p.cashValueSeries?.length > 0);
    return withSeries?.cashValueSeries ?? PORTFOLIO_CASH_VALUE;
  }, [policies]);

  return (
    <PoliciesContext.Provider value={{
      policies,
      addPolicy,
      removePolicy,
      updatePolicy,
      portfolioScore,
      totalCoverage,
      totalMonthlyPremium,
      estimatedCashValue,
      upcomingEvents,
      nextPremium,
      cashValueHistory,
      isGuestData: !storageKey,
    }}>
      {children}
    </PoliciesContext.Provider>
  );
};

export const usePolicies = () => useContext(PoliciesContext);
