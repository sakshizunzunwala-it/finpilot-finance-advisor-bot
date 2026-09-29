import React from 'react';
import { Target, Plus, Shield, Plane, Home, Laptop, Sparkles, Trash2 } from 'lucide-react';
import { GoalItem, UserProfile } from '../types/finance';

interface GoalProgressCardsProps {
  goals: GoalItem[];
  user: UserProfile;
  onContribute: (goalId: number) => void;
  onDeleteGoal: (goalId: number) => void;
  onOpenAddGoal: () => void;
}

export const GoalProgressCards: React.FC<GoalProgressCardsProps> = ({
  goals,
  user,
  onContribute,
  onDeleteGoal,
  onOpenAddGoal,
}) => {
  const getGoalIcon = (iconName: string, category: string) => {
    switch (category) {
      case 'Emergency': return Shield;
      case 'Travel': return Plane;
      case 'Purchase': return Laptop;
      default: return Target;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Active Target Goals
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Milestones and dedicated emergency safety buffers
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const Icon = getGoalIcon(goal.icon, goal.category);
          const pct = Math.min(
            100,
            Math.round((goal.current_amount / goal.target_amount) * 100)
          );

          // SVG mini progress ring math
          const radius = 22;
          const circ = 2 * Math.PI * radius;
          const offset = circ - (pct / 100) * circ;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800/80 glass-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                        {goal.category}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                        {goal.title}
                      </h4>
                    </div>
                  </div>

                  {/* Ring Progress Indicator */}
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 54 54">
                      <circle
                        cx="27"
                        cy="27"
                        r={radius}
                        stroke="#334155"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      <circle
                        cx="27"
                        cy="27"
                        r={radius}
                        stroke="#8b5cf6"
                        strokeWidth="4"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono-nums">
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 my-3">
                  <div className="flex justify-between text-xs font-mono-nums">
                    <span className="text-emerald-400 font-semibold">
                      {user.currency}{goal.current_amount.toLocaleString()}
                    </span>
                    <span className="text-slate-400">
                      of {user.currency}{goal.target_amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Linear Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Deadline: <span className="text-slate-300">{goal.deadline}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onContribute(goal.id)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>Contribute</span>
                </button>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete goal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-3 p-8 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-violet-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No Financial Goals Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your emergency cushion, equipment fund, or travel budget to start tracking progress.
            </p>
            <button
              onClick={onOpenAddGoal}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white"
            >
              + Create First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
