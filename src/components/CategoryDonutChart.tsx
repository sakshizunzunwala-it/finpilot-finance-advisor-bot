import React, { useState } from 'react';
import { ExpenseItem, UserProfile } from '../types/finance';

interface CategoryDonutChartProps {
  expenses: ExpenseItem[];
  user: UserProfile;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Groceries: '#10b981',
  Rent: '#8b5cf6',
  Transport: '#3b82f6',
  Utilities: '#06b6d4',
  Entertainment: '#ec4899',
  Shopping: '#f43f5e',
  Education: '#6366f1',
  Healthcare: '#14b8a6',
  Other: '#94a3b8',
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  expenses,
  user,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Calculate totals per category
  const categoryTotals: Record<string, number> = {};
  let totalSpent = 0;

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    totalSpent += e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  // SVG Donut Slices
  let cumulativeAngle = 0;
  const radius = 50;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const slices = sortedCategories.map(([category, amount]) => {
    const fraction = totalSpent > 0 ? amount / totalSpent : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      category,
      amount,
      percentage: Math.round(fraction * 100),
      color: CATEGORY_COLORS[category] || '#a855f7',
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = activeCategory
    ? slices.find((s) => s.category === activeCategory)
    : slices[0];

  return (
    <div className="rounded-2xl p-6 glass-panel border border-slate-800/80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Outflow Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">By category distribution</p>
        </div>
        <span className="text-xs font-semibold text-slate-300 font-mono-nums">
          {user.currency}{totalSpent.toLocaleString()} Total
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-2">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <div className="w-40 h-40">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 140 140"
            >
              {slices.length === 0 ? (
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#334155"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
              ) : (
                slices.map((slice) => (
                  <circle
                    key={slice.category}
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={
                      activeCategory === slice.category
                        ? strokeWidth + 3
                        : strokeWidth
                    }
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    fill="transparent"
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    onMouseEnter={() => setActiveCategory(slice.category)}
                    onMouseLeave={() => setActiveCategory(null)}
                  />
                ))
              )}
            </svg>
          </div>

          {/* Central Label */}
          <div className="absolute text-center pointer-events-none">
            <span className="text-xs text-slate-400 block truncate max-w-[90px]">
              {activeSlice?.category || 'Total'}
            </span>
            <span className="text-base font-bold text-white font-mono-nums block">
              {activeSlice?.percentage || 0}%
            </span>
            <span className="text-[10px] text-violet-400 font-mono-nums block">
              {user.currency}
              {(activeSlice?.amount || totalSpent).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {sortedCategories.slice(0, 5).map(([cat, amt]) => {
            const pct =
              totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
            const color = CATEGORY_COLORS[cat] || '#a855f7';
            return (
              <div
                key={cat}
                onMouseEnter={() => setActiveCategory(cat)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === cat ? 'bg-slate-800/80' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-300 font-medium truncate">
                    {cat}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-nums shrink-0">
                  <span className="text-slate-400">{pct}%</span>
                  <span className="text-slate-200 font-medium">
                    {user.currency}{amt.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
          {sortedCategories.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">
              No expenses recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
