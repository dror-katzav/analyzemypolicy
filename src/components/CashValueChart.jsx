import React, { useState } from 'react';
import { fmt, fmtFull } from '../utils/formatters';

const CashValueChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);

  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 24, bottom: 36, left: 56 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;

  const allValues = data.map((d) => d.actual ?? d.projected ?? 0).filter(Boolean);
  const maxVal = Math.max(...allValues) * 1.1;
  const minYear = data[0]?.year ?? new Date().getFullYear();
  const maxYear = data[data.length - 1]?.year ?? minYear + 10;

  const xp = (year) => ((year - minYear) / (maxYear - minYear)) * cw;
  const yp = (val) => ch - (val / maxVal) * ch;

  const actualPts = data
    .filter((d) => d.actual !== undefined)
    .map((d) => ({ x: xp(d.year), y: yp(d.actual), ...d }));

  const projectedPts = data
    .filter((d) => d.projected !== undefined || (d.actual !== undefined && d.year === 2026))
    .map((d) => ({ x: xp(d.year), y: yp(d.projected ?? d.actual), ...d }));

  const toPolyline = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');
  const toArea = (pts) => {
    if (!pts.length) return '';
    const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
    return `${pts[0].x},${ch} ${line} ${pts[pts.length - 1].x},${ch}`;
  };

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
  const xTicks = [2015, 2020, 2026, 2030, 2035, 2040].filter(yr => yr >= minYear && yr <= maxYear);
  const currentX = xp(2026);

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }} onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={0} y1={yp(v)} x2={cw} y2={yp(v)} stroke="#334155" strokeWidth="1" />
              <text x={-8} y={yp(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {v === 0 ? '$0' : fmt(v)}
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text key={yr} x={xp(yr)} y={ch + 20} textAnchor="middle" fontSize="10" fill={yr === 2026 ? '#f59e0b' : '#64748b'} fontWeight={yr === 2026 ? 'bold' : 'normal'}>
              {yr}
            </text>
          ))}
          <line x1={currentX} y1={0} x2={currentX} y2={ch} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          <text x={currentX + 4} y={10} fontSize="9" fill="#f59e0b" opacity="0.8">Today</text>
          {projectedPts.length > 1 && <polygon points={toArea(projectedPts)} fill="url(#projGrad)" />}
          {actualPts.length > 1 && <polygon points={toArea(actualPts)} fill="url(#actualGrad)" />}
          {projectedPts.length > 1 && (
            <polyline points={toPolyline(projectedPts)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
          )}
          {actualPts.length > 1 && (
            <polyline points={toPolyline(actualPts)} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          )}
          {[...actualPts, ...projectedPts.slice(1)].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4"
              fill={pt.actual !== undefined ? '#f59e0b' : '#1e293b'}
              stroke="#f59e0b" strokeWidth="2" className="cursor-pointer"
              onMouseEnter={() => setTooltip({ x: pt.x, y: pt.y, year: pt.year, value: pt.actual ?? pt.projected, isProjected: pt.projected !== undefined && pt.actual === undefined })}
            />
          ))}
          {tooltip && (
            <g transform={`translate(${Math.min(tooltip.x, cw - 80)},${Math.max(tooltip.y - 48, 0)})`}>
              <rect x={0} y={0} width={90} height={38} rx={6} fill="#1e293b" stroke="#334155" />
              <text x={8} y={14} fontSize="10" fill="#94a3b8">{tooltip.year} {tooltip.isProjected ? '(proj.)' : ''}</text>
              <text x={8} y={29} fontSize="13" fill="#f59e0b" fontWeight="bold">{fmtFull(tooltip.value)}</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

export default CashValueChart;
