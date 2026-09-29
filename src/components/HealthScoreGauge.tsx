import React from 'react';
import { Activity, Award, CheckCircle2 } from 'lucide-react';
import { UserProfile, GoalItem } from '../types/finance';

interface HealthScoreGaugeProps {
  user: UserProfile;
  score: number;
  savingsRate: number;
  goals: GoalItem[];
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  user,
  score,
  savingsRate,
  goals
}) => {
  // SVG circular gauge math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreTier = (val: number) => {
    if (val >= 80) return { label: 'Excellent', color: 'text-emerald-400', desc: 'Top tier fiscal prudence' };
    if (val >= 65) return { label: 'Good', color: 'text-violet-400', desc: 'Balanced growth & resilience' };
    if (val >= 50) return { label: 'Moderate', color: 'text-amber-400', desc: 'Room for expense trimming' };
    return { label: 'Needs Focus', color: 'text-rose-400', desc: 'High outflow volatility' };
  };

  const tier = getScoreTier(score);

  return (
    <div className="rounded-2xl p-6 glass-panel border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Financial Health Score
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Multi-vector fiscal diagnostic</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 ${tier.color}`}>
          {tier.label}
        </span>
      </div>

      {/* Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            {/* Background Track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-800/80"
              fill="transparent"
            />
            {/* Colored Dynamic Stroke */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="url(#healthScoreGrad)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="healthScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Value */}
          <div className="absolute text-center">
            <span className="text-3xl font-extrabold text-white font-mono-nums tracking-tight">
              {score}
            </span>
            <span className="text-[10px] block text-slate-400 uppercase tracking-wider font-semibold">
              / 100 Pts
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          {tier.desc}
        </p>
      </div>

      {/* Sub-Metric Drivers */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Savings Velocity
          </span>
          <span className="font-semibold font-mono-nums text-emerald-400">{savingsRate}% Rate</span>
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Award className="w-3.5 h-3.5 text-violet-400" />
            Active Milestones
          </span>
          <span className="font-semibold font-mono-nums text-slate-200">{goals.length} Tracked</span>
        </div>
      </div>
    </div>
  );
};
