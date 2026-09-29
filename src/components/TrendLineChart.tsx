import React, { useState } from 'react';
import { UserProfile } from '../types/finance';

interface TrendLineChartProps {
  user: UserProfile;
  totalIncome: number;
  totalSpent: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  user,
  totalIncome,
  totalSpent,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Generate 6-month realistic trajectory anchored to current figures
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const data = [
    { month: 'Apr', income: Math.round(totalIncome * 0.9), expense: Math.round(totalSpent * 0.82) },
    { month: 'May', income: Math.round(totalIncome * 0.92), expense: Math.round(totalSpent * 0.88) },
    { month: 'Jun', income: Math.round(totalIncome * 0.95), expense: Math.round(totalSpent * 0.94) },
    { month: 'Jul', income: Math.round(totalIncome * 1.05), expense: Math.round(totalSpent * 1.02) },
    { month: 'Aug', income: Math.round(totalIncome * 0.98), expense: Math.round(totalSpent * 0.9) },
    { month: 'Sep', income: totalIncome, expense: totalSpent },
  ];

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense))) * 1.15 || 100000;
  const width = 420;
  const height = 160;
  const paddingX = 30;
  const paddingY = 20;

  const getCoordinates = (val: number, index: number) => {
    const x = paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (val / maxVal) * (height - 2 * paddingY);
    return { x, y };
  };

  // Generate path strings
  const incomePoints = data.map((d, i) => getCoordinates(d.income, i));
  const expensePoints = data.map((d, i) => getCoordinates(d.expense, i));

  const generateSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      const prev = a[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');
  };

  const incomePath = generateSmoothPath(incomePoints);
  const expensePath = generateSmoothPath(expensePoints);

  const incomeArea = `${incomePath} L ${incomePoints[incomePoints.length - 1].x},${height - paddingY} L ${incomePoints[0].x},${height - paddingY} Z`;
  const expenseArea = `${expensePath} L ${expensePoints[expensePoints.length - 1].x},${height - paddingY} L ${expensePoints[0].x},${height - paddingY} Z`;

  return (
    <div className="rounded-2xl p-6 glass-panel border border-slate-800/80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            6-Month Cashflow Trajectory
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Inflow vs outflow velocity</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Expenses</span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full overflow-hidden my-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#334155"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />

          {/* Filled Areas */}
          <path d={incomeArea} fill="url(#incomeFill)" />
          <path d={expenseArea} fill="url(#expenseFill)" />

          {/* Stroke Lines */}
          <path d={incomePath} fill="none" stroke="#10b981" strokeWidth="2.5" />
          <path d={expensePath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />

          {/* Points */}
          {incomePoints.map((pt, idx) => (
            <circle
              key={`inc-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              className="fill-emerald-400 stroke-slate-900 stroke-2 cursor-pointer hover:r-5 transition-all"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {expensePoints.map((pt, idx) => (
            <circle
              key={`exp-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="3"
              className="fill-rose-400 stroke-slate-900 stroke-2 cursor-pointer hover:r-4 transition-all"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {/* Month Labels */}
          {data.map((d, idx) => {
            const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
            return (
              <text
                key={d.month}
                x={x}
                y={height - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-sans"
              >
                {d.month}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div className="absolute top-2 right-4 bg-slate-900/95 border border-slate-700/80 p-2 rounded-lg text-xs shadow-xl backdrop-blur-md pointer-events-none">
            <p className="font-semibold text-white">{data[hoverIndex].month} Snapshot</p>
            <div className="flex gap-3 mt-1 font-mono-nums">
              <span className="text-emerald-400">+{user.currency}{data[hoverIndex].income.toLocaleString()}</span>
              <span className="text-rose-400">-{user.currency}{data[hoverIndex].expense.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
