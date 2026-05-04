import React from 'react';

const ScoreRing = ({ score, size = 100 }) => {
  const isDashboard = size < 80; // smaller sizes don't need the text "OUT OF 100"
  const r = (size - (isDashboard ? 8 : 10)) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Good Standing' : score >= 65 ? 'Needs Review' : 'Action Required';

  if (isDashboard) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#334155" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={size > 40 ? "13" : "11"} fill={color} fontWeight="bold">
          {score}
        </text>
      </svg>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#334155" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="26" fill={color} fontWeight="bold">{score}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="10" fill="#64748b">OUT OF 100</text>
      </svg>
      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide" style={{ background: color + '20', color }}>
        {label}
      </span>
    </div>
  );
};

export default ScoreRing;
