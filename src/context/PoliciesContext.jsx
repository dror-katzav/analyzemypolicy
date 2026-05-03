import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MOCK_POLICIES, UPCOMING_EVENTS, PORTFOLIO_CASH_VALUE } from '../data/mockData';

const PoliciesContext = createContext();

const STORAGE_KEY = 'amp_policies';

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

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const PoliciesProvider = ({ children }) => {
  const [policies, setPolicies] = useState(() => loadSaved() ?? MOCK_POLICIES);

  const addPolicy = useCallback((policy) => {
    setPolicies((prev) => {
      const next = [policy, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removePolicy = useCallback((id) => {
    setPolicies((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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

  // Upcoming events: built from policy milestone data
  const upcomingEvents = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const events = [];
    policies.forEach((p) => {
      (p.milestones ?? [])
        .filter((m) => !m.isPast)
        .forEach((m) => {
          const d = new Date(m.date); d.setHours(0, 0, 0, 0);
          const days = Math.round((d - today) / 86400000);
          if (days <= 1461) { // show events within ~4 years
            events.push({
              id: m.id,
              date: m.date,
              daysAway: days,
              urgency: m.isUrgent ? 'critical' : m.type === 'premium' ? 'high' : m.type === 'warning' || m.type === 'critical' ? 'high' : 'medium',
              label: m.label,
              detail: `${p.shortName} — ${m.detail}`,
              policyId: p.id,
            });
          }
        });
    });
    return events.sort((a, b) => a.daysAway - b.daysAway).slice(0, 4);
  }, [policies]);

  // Next premium info
  const nextPremium = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const premiumMilestones = policies
      .flatMap((p) =>
        (p.milestones ?? [])
          .filter((m) => m.type === 'premium' && !m.isPast)
          .map((m) => ({ ...m, premium: p.premium, policyName: p.shortName, policyId: p.id }))
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!premiumMilestones.length) return null;
    const next = premiumMilestones[0];
    const d = new Date(next.date); d.setHours(0, 0, 0, 0);
    return { date: next.date, amount: next.premium, policyName: next.policyName };
  }, [policies]);

  return (
    <PoliciesContext.Provider value={{
      policies,
      addPolicy,
      removePolicy,
      portfolioScore,
      totalCoverage,
      totalMonthlyPremium,
      estimatedCashValue,
      upcomingEvents,
      nextPremium,
      cashValueHistory: PORTFOLIO_CASH_VALUE,
    }}>
      {children}
    </PoliciesContext.Provider>
  );
};

export const usePolicies = () => useContext(PoliciesContext);
