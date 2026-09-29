import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  PieChart, 
  Target, 
  FileText, 
  Bot, 
  Sparkles,
  Settings,
  Briefcase,
  GraduationCap,
  Users,
  Building2
} from 'lucide-react';
import { UserProfile, ProfileType } from '../types/finance';

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenProfileModal: () => void;
  onLoadDemoData: (profileType?: ProfileType) => void;
  isLoadingDemo: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onSelectTab,
  onOpenProfileModal,
  onLoadDemoData,
  isLoadingDemo
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income Streams', icon: Wallet },
    { id: 'expenses', label: 'Expense Ledger', icon: Receipt },
    { id: 'budget', label: 'AI Budget Plan', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'report', label: 'Summary Report', icon: FileText },
    { id: 'advisor', label: 'AI Chat Advisor', icon: Bot },
  ];

  const getProfileIcon = () => {
    switch (user.profile_type) {
      case 'College Student': return GraduationCap;
      case 'Freelancer': return Briefcase;
      case 'Household Manager': return Users;
      default: return Building2;
    }
  };

  const ProfileIcon = getProfileIcon();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-2xl p-4 hidden md:flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/25 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Persona Scenario Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-violet-500/10 text-violet-400">
              <ProfileIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{user.profile_type}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {user.profile_type === 'Freelancer' && "Optimized for fluctuating client invoices, tax withholding, and 6-month lean runway."}
            {user.profile_type === 'College Student' && "Focuses on daily allowance limits, campus transit savings, and student deals."}
            {user.profile_type === 'Household Manager' && "Tracks shared family pantry costs, utilities, and emergency sinking funds."}
            {user.profile_type === 'Salaried Professional' && "Applies 50/30/20 wealth building, emergency SIP transfers, and tax savings."}
          </p>
        </div>
      </div>

      {/* Footer / User Profile & Demo Switcher */}
      <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
        <button
          onClick={onOpenProfileModal}
          className="w-full text-left p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-[11px] text-violet-400 truncate">{user.currency} {user.monthly_income.toLocaleString()} / mo</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </button>

        <button
          onClick={() => onLoadDemoData(user.profile_type)}
          disabled={isLoadingDemo}
          className="w-full py-2 px-3 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isLoadingDemo ? 'Seeding Profile...' : 'Load Demo Data'}</span>
        </button>
      </div>
    </aside>
  );
};
