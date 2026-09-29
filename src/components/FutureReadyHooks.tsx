import React from 'react';
import { LineChart, Sparkles, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface FutureReadyHooksProps {
  user: UserProfile;
}

export const FutureReadyHooks: React.FC<FutureReadyHooksProps> = ({ user }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            Future-Ready AI Intelligence Hooks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Next-generation predictive financial automation pipelines
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hook 1: Predictive Spending */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <LineChart className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Coming Soon
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1.5">
            Predictive Spending Analytics
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monte Carlo probabilistic burn modeling will forecast 90-day cash depletion dates and alert you before overdraft thresholds occur.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Forecast Horizon: 90 Days</span>
            <span className="text-violet-400 font-mono-nums">v2.1 Preview</span>
          </div>
        </div>

        {/* Hook 2: Investment Suggestions */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Coming Soon
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1.5">
            Smart Investment Suggestions
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated allocation across low-cost index funds, sovereign digital gold, and high-yield liquid emergency reserves tuned for {user.profile_type}.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Risk Optimization: Dynamic</span>
            <span className="text-emerald-400 font-mono-nums">Index + Debt</span>
          </div>
        </div>

        {/* Hook 3: Automated Bill & Tax Assistant */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Coming Soon
            </span>
          </div>

          <h4 className="text-sm font-bold text-white mb-1.5">
            Intelligent Tax & Bill Assistant
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated quarterly advance tax deductions and recurring utility invoice sanity scans to prevent late penalties.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Deductions: 80C / NPS</span>
            <span className="text-indigo-400 font-mono-nums">Auto-Scan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
