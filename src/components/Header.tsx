import React from 'react';
import { Plus, Moon, Sun, Code2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/finance';

interface HeaderProps {
  user: UserProfile;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenExpenseModal: () => void;
  onOpenPythonFiles: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  onToggleTheme,
  onOpenExpenseModal,
  onOpenPythonFiles,
  activeTab,
  onSelectTab
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors duration-200">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            FP
          </div>
          <span className="text-base font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
            FinPilot
          </span>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
          <Sparkles className="w-3 h-3 text-violet-400" />
          {user.profile_type}
        </span>
      </div>

      {/* Zone 2: Navigation Links (desktop) */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'income', label: 'Income' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'budget', label: 'AI Budget' },
          { id: 'goals', label: 'Goals' },
          { id: 'report', label: 'Report' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              activeTab === item.id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPythonFiles}
          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
          title="Inspect and copy Python/Flask files (app.py, models.py, ai_engine.py)"
        >
          <Code2 className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden md:inline">Flask Files</span>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={onOpenExpenseModal}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Expense</span>
        </button>
      </div>
    </header>
  );
};
