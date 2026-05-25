export const MOCK_USER = {
  firstName: 'James',
  lastName: 'Harrison',
  email: 'james@harrison.com',
};

export const MOCK_POLICIES = [
  {
    id: 'pol-001',
    name: 'MetLife Whole Life',
    shortName: 'Whole Life',
    type: 'Whole Life',
    carrier: 'MetLife',
    carrierInitials: 'ML',
    carrierColor: '#0e6cc4',
    faceAmount: 1500000,
    premium: 580,
    premiumFrequency: 'monthly',
    nextPremiumDate: '2026-06-01',
    nextPremiumDaysAway: 3,
    issueDate: '2015-03-01',
    insured: 'James Harrison',
    beneficiary: 'Sarah Harrison',
    cashValue: 87500,
    deathBenefit: 1500000,
    score: 82,
    scoreLabel: 'Good Standing',
    scoreColor: 'green',
    status: 'active',
    statusLabel: 'Active',
    summary:
      'A $1.5M permanent whole life policy issued in 2015. Cash value has been growing steadily. Beneficiary designation may need updating to align with your current estate plan.',
    strengths: [
      'Coverage amount aligns with income replacement needs',
      'Consistent premium payment history',
      'Cash value growing on track with illustration',
    ],
    opportunities: [
      {
        id: 'op-1',
        severity: 'medium',
        title: 'Your Beneficiary Designation Is 11 Years Old — Update It Today',
        description:
          'Your beneficiary was last set in 2015. Life changes — divorce, new children, remarriage, estate plan updates — can make outdated designations legally complicated for families at the worst possible time. This takes under 10 minutes to update and is free.',
        cta: 'Review Now',
      },
      {
        id: 'op-2',
        severity: 'low',
        title: 'Buy Paid-Up Additions This Year — Window Is Open Now',
        description:
          'You can purchase paid-up additions (PUAs) this policy year to accelerate your cash value tax-free. This option resets annually — if you miss this year\'s window, you cannot retroactively buy PUAs for 2026. Contact MetLife to exercise this option before your policy anniversary.',
        cta: 'Learn More',
      },
    ],
    milestones: [
      {
        id: 'ms-1',
        date: '2025-03-01',
        isPast: true,
        type: 'review',
        label: '10-Year Policy Anniversary',
        detail: 'Passed. Ideal time to review coverage adequacy.',
      },
      {
        id: 'ms-2',
        date: '2026-06-01',
        isPast: false,
        isUrgent: false,
        type: 'premium',
        label: 'Premium Payment Due',
        detail: '$580 due Jun 1, 2026.',
      },
      {
        id: 'ms-3',
        date: '2030-03-01',
        isPast: false,
        type: 'review',
        label: '15-Year Policy Review',
        detail: 'Consider coverage adequacy, dividend options, and estate alignment.',
      },
      {
        id: 'ms-4',
        date: '2035-03-01',
        isPast: false,
        type: 'option',
        label: 'Reduced Paid-Up Option Available',
        detail: 'At this point, cash value can fully fund the policy — no more premiums required.',
      },
      {
        id: 'ms-5',
        date: '2045-03-01',
        isPast: false,
        type: 'endowment',
        label: 'Policy Endowment Date',
        detail: 'Policy matures. Cash value equals death benefit.',
      },
    ],
    cashValueSeries: [
      { year: 2015, actual: 0 },
      { year: 2016, actual: 7200 },
      { year: 2017, actual: 16800 },
      { year: 2018, actual: 28400 },
      { year: 2019, actual: 41000 },
      { year: 2020, actual: 55600 },
      { year: 2021, actual: 65200 },
      { year: 2022, actual: 72800 },
      { year: 2023, actual: 80000 },
      { year: 2024, actual: 87500 },
      { year: 2025, actual: 95400 },
      { year: 2026, actual: 103800 },
      { year: 2027, projected: 113000 },
      { year: 2028, projected: 123200 },
      { year: 2029, projected: 134200 },
      { year: 2030, projected: 146000 },
      { year: 2031, projected: 158600 },
      { year: 2032, projected: 172200 },
      { year: 2033, projected: 186600 },
      { year: 2034, projected: 202000 },
      { year: 2035, projected: 218600 },
      { year: 2040, projected: 312000 },
    ],
  },
  {
    id: 'pol-002',
    name: 'Protective 20-Year Term',
    shortName: 'Term Life',
    type: 'Term Life',
    carrier: 'Protective Life',
    carrierInitials: 'PL',
    carrierColor: '#7c3aed',
    faceAmount: 500000,
    premium: 267,
    premiumFrequency: 'monthly',
    nextPremiumDate: '2026-05-28',
    nextPremiumDaysAway: 24,
    issueDate: '2020-04-28',
    insured: 'James Harrison',
    beneficiary: 'Sarah Harrison',
    cashValue: 0,
    deathBenefit: 500000,
    score: 68,
    scoreLabel: 'Needs Review',
    scoreColor: 'amber',
    status: 'active',
    statusLabel: 'Active',
    summary:
      'A 20-year term policy expiring in 2040. No cash value accumulation. A conversion window opens in 2030 — acting before then will lock in your current health classification.',
    strengths: [
      'Low premium relative to face amount',
      'Covers key income-earning years through 2040',
    ],
    opportunities: [
      {
        id: 'op-3',
        severity: 'high',
        title: 'You Can Convert to a Cash-Value Policy Without a Medical Exam — Get a Quote Now',
        description:
          'Your policy includes a conversion privilege: you can switch to permanent (whole life or universal life) coverage without new underwriting. Your current health rating is locked in — meaning no medical questions, no labs, no risk of being rated up. Getting a conversion quote costs nothing and lets you compare exactly what permanent coverage would cost at today\'s rates versus waiting until 2030 when premiums will be higher.',
        cta: 'Get Conversion Quote',
      },
      {
        id: 'op-4',
        severity: 'medium',
        title: 'Your Coverage Gap Has Likely Grown — Check It in 2 Minutes',
        description:
          'Your $500K coverage was set in 2020. Since then, inflation, income growth, and mortgage changes have likely widened the gap between what you have and what your family actually needs. Run a quick coverage check to see your number — it takes 2 minutes and requires no commitment.',
        cta: 'Check My Gap',
      },
      {
        id: 'op-5',
        severity: 'medium',
        title: 'Better Rates Are Available Right Now — You Could Save Up to $82/Month',
        description:
          'Market rates for 20-year term policies have dropped since 2020. Based on your age and health profile, comparable $500K coverage could be available for $185–220/month — potentially saving $564–$984 per year. This is not about switching carriers; it\'s about whether you\'re paying the right price for what you have.',
        cta: 'Compare Rates Now',
      },
    ],
    milestones: [
      {
        id: 'ms-6',
        date: '2026-05-28',
        isPast: false,
        isUrgent: false,
        type: 'premium',
        label: 'Premium Due',
        detail: '$267 due May 28, 2026.',
      },
      {
        id: 'ms-7',
        date: '2030-04-28',
        isPast: false,
        type: 'option',
        label: 'Conversion Window Opens',
        detail: 'You may convert to permanent insurance without medical underwriting. Best acted on before any health changes.',
      },
      {
        id: 'ms-8',
        date: '2035-04-28',
        isPast: false,
        type: 'warning',
        label: 'Conversion Window Closes',
        detail: 'After this date, conversion is no longer available. At policy end, coverage disappears entirely.',
      },
      {
        id: 'ms-9',
        date: '2040-04-28',
        isPast: false,
        type: 'critical',
        label: 'Policy Expires — Coverage Ends',
        detail: 'Policy terminates. If no action taken, $500K coverage disappears entirely with no cash value.',
      },
    ],
    cashValueSeries: [],
  },
];

export const PORTFOLIO_SUMMARY = {
  totalCoverage: 2000000,
  totalMonthlyPremium: 847,
  estimatedCashValue: 87500,
  portfolioScore: 76,
  nextPremiumDate: '2026-05-28',
  nextPremiumAmount: 267,
  nextPremiumPolicy: 'Protective 20-Year Term',
};

export const UPCOMING_EVENTS = [
  {
    id: 'ev-1',
    date: '2026-05-28',
    daysAway: 24,
    urgency: 'high',
    label: 'Premium Due',
    detail: 'Protective Term — $267',
    policyId: 'pol-002',
  },
  {
    id: 'ev-2',
    date: '2026-06-01',
    daysAway: 28,
    urgency: 'high',
    label: 'Premium Payment Due',
    detail: 'MetLife Whole Life — $580',
    policyId: 'pol-001',
  },
  {
    id: 'ev-3',
    date: '2030-04-28',
    daysAway: 1461,
    urgency: 'medium',
    label: 'Conversion Window Opens',
    detail: 'Protective Term — Act before health changes',
    policyId: 'pol-002',
  },
  {
    id: 'ev-4',
    date: '2030-03-01',
    daysAway: 1402,
    urgency: 'low',
    label: '15-Year Policy Review',
    detail: 'MetLife Whole Life — Benchmark coverage',
    policyId: 'pol-001',
  },
];

export const PORTFOLIO_CASH_VALUE = [
  { year: 2015, actual: 0 },
  { year: 2016, actual: 7200 },
  { year: 2017, actual: 16800 },
  { year: 2018, actual: 28400 },
  { year: 2019, actual: 41000 },
  { year: 2020, actual: 55600 },
  { year: 2021, actual: 65200 },
  { year: 2022, actual: 72800 },
  { year: 2023, actual: 80000 },
  { year: 2024, actual: 87500 },
  { year: 2025, actual: 95400 },
  { year: 2026, actual: 103800 },
  { year: 2027, projected: 113000 },
  { year: 2028, projected: 123200 },
  { year: 2029, projected: 134200 },
  { year: 2030, projected: 146000 },
  { year: 2031, projected: 158600 },
  { year: 2032, projected: 172200 },
  { year: 2033, projected: 186600 },
  { year: 2034, projected: 202000 },
  { year: 2035, projected: 218600 },
  { year: 2040, projected: 312000 },
];

export const ADVISOR = {
  name: 'Michael Torres, CFP®',
  title: 'Senior Policy Advisor',
  firm: 'AnalyzeMyPolicy Advisory',
  avatar: 'MT',
  avatarColor: '#0e6cc4',
  rating: 4.9,
  reviews: 214,
  specialty: ['Estate Planning', 'Whole Life', 'Long-Term Care'],
  bio: 'Michael has 18 years of experience helping high-net-worth families optimize their life insurance portfolios. He specializes in estate planning integration and permanent life strategies.',
  responseTime: 'Typically replies within 2 hours',
};

const getUpcomingCall = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const UPCOMING_CALLS = [
  {
    id: 'call-1',
    type: 'video',
    title: 'Policy Review — MetLife Whole Life',
    date: getUpcomingCall(),
    time: '10:00 AM EST',
    status: 'confirmed',
  },
];

export const ADVISOR_MESSAGES = [
  {
    id: 'm-1',
    from: 'advisor',
    text: "I've reviewed your portfolio analysis. Your MetLife policy is in great shape. I'd like to discuss the beneficiary update and the paid-up additions option on our upcoming call.",
    time: 'Apr 27, 2:14 PM',
  },
  {
    id: 'm-2',
    from: 'user',
    text: 'That sounds great, looking forward to it. Should I bring the original policy documents?',
    time: 'Apr 27, 3:01 PM',
  },
  {
    id: 'm-3',
    from: 'advisor',
    text: "No need — I already have your analysis from AnalyzeMyPolicy. Just bring any questions you have about the conversion option for your Protective term policy. That's the main opportunity I want to walk you through.",
    time: 'Apr 28, 9:22 AM',
  },
];

export const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

export const getNextWeekdays = () => {
  const days = [];
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1); // start tomorrow
  while (days.length < 5) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({
        label: labels[dow],
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
};

/**
 * Build a policy object from an uploaded file.
 * @param {string|null} fileName  - base filename (no extension), used as fallback name
 * @param {object|null} extracted - result of parsePolicy() — carrier, faceAmount, premium, etc.
 */
export const createDemoPolicy = (fileName, extracted = null) => {
  const isWhole = extracted?.policyType === 'Whole Life' || extracted?.policyType === 'Universal Life';
  const id = 'pol-' + Date.now();

  const carrier = extracted?.carrier || 'Your Carrier';
  const initials = carrier.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'UP';
  const faceAmount = extracted?.faceAmount || 2000000;
  const premium = extracted?.premium || 320;
  const type = extracted?.policyType || 'Term Life';
  const issueDate = extracted?.issueDate || new Date().toISOString().slice(0, 10);
  const policyName = fileName || (extracted?.carrier ? `${extracted.carrier} Policy` : 'Uploaded Policy');

  // Carrier color based on known carriers, else purple
  const CARRIER_COLORS = {
    MetLife: '#0e6cc4', 'Protective Life': '#7c3aed', Prudential: '#1a5c3c',
    AIG: '#b91c1c', Nationwide: '#1e40af', Transamerica: '#0f766e',
    'New York Life': '#374151', 'Pacific Life': '#0369a1',
  };
  const carrierColor = CARRIER_COLORS[carrier] || '#7c3aed';

  return {
    id,
    name: policyName,
    shortName: type,
    type,
    carrier,
    carrierInitials: initials,
    carrierColor,
    faceAmount,
    premium,
    premiumFrequency: extracted?.premiumFrequency || 'monthly',
    nextPremiumDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    issueDate,
    insured: extracted?.insuredName || 'Policy Holder',
    beneficiary: extracted?.beneficiary || 'Beneficiary',
    cashValue: isWhole ? Math.round(premium * 12 * 0.4) : 0,
    deathBenefit: faceAmount,
    score: 72,
    scoreLabel: 'Needs Review',
    scoreColor: 'amber',
    status: 'active',
    statusLabel: 'Active',
    summary: `${type} policy from ${carrier}. Coverage of $${(faceAmount / 1_000_000).toFixed(1)}M analyzed via AnalyzeMyPolicy. Beneficiary and coverage adequacy items identified for review.`,
    strengths: [
      'Coverage amount aligns with income replacement needs',
      type === 'Whole Life' ? 'Cash value growth provides tax-deferred savings' : 'Term covers key wealth-building years',
    ],
    opportunities: [
      { id: `op-${id}-1`, severity: 'medium', title: 'Review Beneficiary Designations', description: 'Your beneficiary designations may need updating to reflect current estate plans.', cta: 'Review Now' },
      { id: `op-${id}-2`, severity: 'low', title: 'Better Rates May Be Available', description: 'Comparable policies may offer similar coverage at a lower premium. A quick rate comparison takes under 5 minutes.', cta: 'Compare Rates' },
    ],
    milestones: [
      { id: `ms-${id}-1`, date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), isPast: false, isUrgent: true, type: 'premium', label: 'First Premium Due', detail: `$${premium} due — review and confirm your first premium payment.` },
      { id: `ms-${id}-2`, date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10), isPast: false, type: 'review', label: 'Annual Policy Review', detail: 'Review coverage adequacy and beneficiary designations.' },
    ],
    cashValueSeries: [],
  };
};
