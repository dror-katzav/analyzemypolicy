/**
 * Atidot Nexus API client
 *
 * Calls the Nexus Flask API (default http://localhost:8080) for:
 *  - Lapse risk prediction (POST /predict/<client>)
 *  - Product recommendation (mock for now — recommender requires a trained model artifact)
 *
 * Gracefully falls back to mock data when Nexus is unreachable.
 */

const NEXUS_URL = (import.meta.env.VITE_NEXUS_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const NEXUS_CLIENT = import.meta.env.VITE_NEXUS_CLIENT || 'AMP_DEMO';

// ─── Health check ─────────────────────────────────────────────────────────────

export const getNexusHealth = async () => {
  try {
    const res = await fetch(`${NEXUS_URL}/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === 'healthy' ? data : null;
  } catch {
    return null;
  }
};

// ─── Lapse risk ───────────────────────────────────────────────────────────────

/**
 * Returns lapse prediction for a single policy.
 * Falls back to deterministic mock when Nexus is unavailable.
 *
 * @param {object} policy - A policy object from mockData / PoliciesContext
 * @returns {{ policy, lapse_probability, risk_score, horizon_scores, source }}
 */
export const getLapseRisk = async (policy) => {
  try {
    const issueYear = policy.issueDate ? new Date(policy.issueDate).getFullYear() : 2015;
    const duration = new Date().getFullYear() - issueYear;

    const res = await fetch(`${NEXUS_URL}/predict/${NEXUS_CLIENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        policy: policy.id,
        face_amount: policy.faceAmount ?? 0,
        annualized_premium: (policy.premium ?? 0) * 12,
        duration,
        zip_code: '10001',
      }),
    });

    if (!res.ok) return mockLapseRisk(policy);
    const data = await res.json();
    return { ...data, source: 'nexus' };
  } catch {
    return mockLapseRisk(policy);
  }
};

// ─── Product recommendation ───────────────────────────────────────────────────

/**
 * Returns a product recommendation for a policy.
 * Uses mock data (the recommender requires a trained model on the Nexus server).
 *
 * @param {object} policy
 * @returns {{ policy_family, rec_face_band, rec_premium_band, rec_payment_mode, rationale, source }}
 */
export const getRecommendation = async (policy) => {
  // Try the Nexus API first — if a recommender model is loaded it will respond
  try {
    const res = await fetch(`${NEXUS_URL}/recommend/${NEXUS_CLIENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000),
      body: JSON.stringify({ policy: policy.id, face_amount: policy.faceAmount }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ...data, source: 'nexus' };
    }
  } catch { /* fall through to mock */ }

  return mockRecommendation(policy);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Combined call: lapse risk + recommendation in parallel */
export const getNexusAnalysis = async (policy) => {
  const [lapse, recommendation] = await Promise.all([
    getLapseRisk(policy),
    getRecommendation(policy),
  ]);
  return { lapse, recommendation };
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockLapseRisk = (policy) => {
  const isTerm = policy.type === 'Term Life';
  return {
    policy: policy.id,
    lapse_probability: isTerm ? 0.31 : 0.09,
    risk_score: isTerm ? 'Medium' : 'Low',
    horizon_scores: isTerm
      ? { lapse_0: 0.12, lapse_1: 0.22, lapse_2: 0.31 }
      : { lapse_0: 0.03, lapse_1: 0.06, lapse_2: 0.09 },
    source: 'mock',
  };
};

const mockRecommendation = (policy) => {
  const isTerm = policy.type === 'Term Life';
  if (isTerm) {
    return {
      policy_family: 'WL',
      rec_face_band: '$500K–$1.0M',
      rec_premium_band: '$380–$620/mo',
      rec_payment_mode: 'MONTHLY',
      rationale:
        'Peer cohort analysis suggests converting to Whole Life before age 50 locks in your current health rating and builds tax-deferred cash value — the most common move for policyholders in your segment.',
      source: 'mock',
    };
  }
  return {
    policy_family: 'WL',
    rec_face_band: '$1.0M–$2.0M',
    rec_premium_band: '$550–$850/mo',
    rec_payment_mode: 'MONTHLY',
    rationale:
      'Your coverage level aligns with peers in your segment. Adding paid-up additions (PUAs) this year could accelerate cash value growth without increasing base premium.',
    source: 'mock',
  };
};

/** Human-friendly risk score color */
export const riskColor = (score) => {
  if (score === 'High') return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
  if (score === 'Medium') return { text: 'text-accent-amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
};
