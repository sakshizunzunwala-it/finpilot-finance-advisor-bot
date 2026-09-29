import React from 'react';
import { Lightbulb, TrendingDown, ArrowRight, Check } from 'lucide-react';
import { SavingSuggestion } from '../types/finance';

interface AiSavingSuggestionsProps {
  suggestions: SavingSuggestion[];
}

export const AiSavingSuggestions: React.FC<AiSavingSuggestionsProps> = ({
  suggestions,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            High-Impact AI Saving Suggestions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Targeted leaks identified through behavioural transaction analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.map((item, idx) => {
          const isCritical = item.impact === 'Critical';
          const isHigh = item.impact === 'High';

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-slate-800/80 glass-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : isHigh
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {item.impact} Impact
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                  {item.tip}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Potential ROI:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono-nums flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  {item.annual_savings}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
