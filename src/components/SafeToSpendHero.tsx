import React, { useEffect, useState } from 'react';
import { ArrowUpRight, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface SafeToSpendHeroProps {
  user: UserProfile;
  totalIncome: number;
  totalSpent: number;
  remainingBuffer: number;
  safeSpendToday: number;
  onOpenExpenseModal: () => void;
}

export const SafeToSpendHero: React.FC<SafeToSpendHeroProps> = ({
  user,
  totalIncome,
  totalSpent,
  remainingBuffer,
  safeSpendToday,
  onOpenExpenseModal
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Smooth animated counter effect
  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const target = safeSpendToday;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * ease);
      setAnimatedValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [safeSpendToday]);

  const spendPct = totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0;
  const isHealthy = remainingBuffer > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-indigo-950/60 border border-violet-500/20 backdrop-blur-2xl shadow-xl shadow-black/40 flex flex-col justify-between">
      {/* Background ambient decorative blurs */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30">
              <ShieldCheck className="w-3 h-3 text-violet-400" />
              Dynamic Cash Buffer
            </span>
            <span className="text-xs text-slate-400">· Active Cycle</span>
          </div>
          <h2 className="text-sm font-medium text-slate-300">
            Safe to Spend Today
          </h2>
        </div>

        <button
          onClick={onOpenExpenseModal}
          className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-xs font-medium text-violet-200 transition-all flex items-center gap-1.5"
        >
          <span>Log Expense</span>
          <ArrowUpRight className="w-3 h-3 text-violet-400" />
        </button>
      </div>

      {/* Central Counter Display */}
      <div className="relative z-10 my-6 sm:my-7">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono-nums">
            {user.currency}{animatedValue.toLocaleString()}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-400">
            / day safe limit
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-lg">
          Calculated from your <span className="text-slate-200 font-semibold">{user.currency}{remainingBuffer.toLocaleString()}</span> unallocated buffer distributed smoothly across the remaining cycle days without compromising your financial goals.
        </p>
      </div>

      {/* Bottom Metrics Ledger */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
        <div>
          <p className="text-[11px] text-slate-400 font-medium">Monthly Inflow</p>
          <p className="text-sm sm:text-base font-bold text-emerald-400 font-mono-nums mt-0.5">
            {user.currency}{totalIncome.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 font-medium">Total Outflow</p>
          <p className="text-sm sm:text-base font-bold text-rose-400 font-mono-nums mt-0.5">
            {user.currency}{totalSpent.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 font-medium">Net Cushion</p>
          <p className={`text-sm sm:text-base font-bold font-mono-nums mt-0.5 ${isHealthy ? 'text-violet-300' : 'text-rose-400'}`}>
            {user.currency}{remainingBuffer.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-slate-400 font-medium">Spent Ratio</p>
          <p className="text-sm sm:text-base font-bold text-white font-mono-nums mt-0.5 flex items-center gap-1">
            <span>{spendPct}%</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </p>
        </div>
      </div>
    </div>
  );
};
