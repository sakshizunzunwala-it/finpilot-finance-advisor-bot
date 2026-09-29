import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { BudgetPlanData, UserProfile, ExpenseItem } from '../types/finance';

interface AiBudgetPlannerProps {
  budgetPlan: BudgetPlanData | null;
  user: UserProfile;
  expenses: ExpenseItem[];
  onRefreshBudget: (useAi: boolean) => Promise<void>;
}

export const AiBudgetPlanner: React.FC<AiBudgetPlannerProps> = ({
  budgetPlan,
  user,
  expenses,
  onRefreshBudget,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshBudget(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const alloc = budgetPlan?.allocations || {
    needs: { percentage: 50, amount: user.monthly_income * 0.5 },
    wants: { percentage: 30, amount: user.monthly_income * 0.3 },
    savings: { percentage: 20, amount: user.monthly_income * 0.2 },
  };

  const limits = budgetPlan?.category_limits || {};
  const alerts = budgetPlan?.overspending_alerts || [];

  // Actual spent per category
  const actualSpent: Record<string, number> = {};
  expenses.forEach((e) => {
    actualSpent[e.category] = (actualSpent[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            AI-Adapted 50/30/20 Budget Blueprint
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated specifically for <span className="text-violet-300 font-semibold">{user.profile_type}</span> cashflow realities
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Recalculating with AI...' : 'Regenerate Budget'}</span>
        </button>
      </div>

      {/* AI Strategy Insights Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/60 via-slate-900/80 to-indigo-950/60 border border-violet-500/25 text-xs text-slate-200 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-violet-300 font-semibold">
          <Layers className="w-4 h-4 text-violet-400" />
          <span>Persona Financial Strategy Directive</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">
          {budgetPlan?.strategy_note ||
            "Maintaining 50/30/20 equilibrium while accelerating automated payday transfers directly into liquid emergency reserves."}
        </p>
      </div>

      {/* Overspending Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Overspending Alerts Detected ({alerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-rose-300">{alert.category}</p>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">{alert.message}</p>
                </div>
                <span className="font-mono-nums font-bold text-rose-400 shrink-0">
                  +{user.currency}{alert.overspend.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 50/30/20 Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Needs */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Needs & Essentials
            </span>
            <span className="text-xs font-bold text-violet-400 px-2 py-0.5 rounded-md bg-violet-500/10">
              {alloc.needs.percentage}% Target
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono-nums mt-1">
            {user.currency}{alloc.needs.amount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Housing, groceries, utility bills, transit, healthcare
          </p>
        </div>

        {/* Wants */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Wants & Lifestyle
            </span>
            <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10">
              {alloc.wants.percentage}% Target
            </span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono-nums mt-1">
            {user.currency}{alloc.wants.amount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Dining out, leisure trips, entertainment, discretionary shopping
          </p>
        </div>

        {/* Savings */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Savings & Runway
            </span>
            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
              {alloc.savings.percentage}% Target
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono-nums mt-1">
            {user.currency}{alloc.savings.amount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Emergency sinking fund, investment accounts, retirement buffer
          </p>
        </div>
      </div>

      {/* Category Wise Limits Table / Grid */}
      <div className="rounded-2xl p-6 glass-panel border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Category Ceilings vs Current Spend Velocity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(limits).map(([category, limitVal]) => {
            const spent = actualSpent[category] || 0;
            const pct = limitVal > 0 ? Math.round((spent / limitVal) * 100) : 0;
            const isOver = spent > limitVal;

            return (
              <div
                key={category}
                className={`p-3.5 rounded-xl border transition-all ${
                  isOver
                    ? 'bg-rose-950/20 border-rose-800/40'
                    : 'bg-slate-900/50 border-slate-800/80'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">{category}</span>
                  <span
                    className={`font-mono-nums text-[11px] font-bold ${
                      isOver ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {pct}% spent
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : pct > 80
                        ? 'bg-amber-400'
                        : 'bg-violet-500'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono-nums">
                  <span className="text-slate-400">
                    Spent: {user.currency}{spent.toLocaleString()}
                  </span>
                  <span className="text-slate-300 font-semibold">
                    Cap: {user.currency}{limitVal.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
