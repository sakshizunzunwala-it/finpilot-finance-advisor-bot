import React, { useState, useEffect } from 'react';
import { X, Sparkles, Building2, GraduationCap, Briefcase, Users } from 'lucide-react';
import { UserProfile, ProfileType } from '../types/finance';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
  onSwitchProfileQuick: (type: ProfileType) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onSwitchProfileQuick,
}) => {
  const [name, setName] = useState(user.name);
  const [profileType, setProfileType] = useState<ProfileType>(user.profile_type);
  const [income, setIncome] = useState(user.monthly_income.toString());
  const [currency, setCurrency] = useState(user.currency || '₹');

  useEffect(() => {
    setName(user.name);
    setProfileType(user.profile_type);
    setIncome(user.monthly_income.toString());
    setCurrency(user.currency || '₹');
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      profile_type: profileType,
      monthly_income: parseFloat(income) || 60000,
      currency,
    });
    onClose();
  };

  const personas: Array<{
    type: ProfileType;
    icon: any;
    desc: string;
    sampleIncome: number;
  }> = [
    {
      type: 'Salaried Professional',
      icon: Building2,
      desc: '50/30/20 Wealth Builder, automatic SIP transfers, tax deductions',
      sampleIncome: 85000,
    },
    {
      type: 'College Student',
      icon: GraduationCap,
      desc: 'Allowance tracking, low-cost meal shares, student transit passes',
      sampleIncome: 25000,
    },
    {
      type: 'Freelancer',
      icon: Briefcase,
      desc: 'Fluctuating multi-client revenue, 6-month lean runway, quarterly tax buffer',
      sampleIncome: 110000,
    },
    {
      type: 'Household Manager',
      icon: Users,
      desc: 'Bulk pantry provisions, family healthcare sinking fund, shared utility caps',
      sampleIncome: 95000,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Onboarding & Financial Profile
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your persona to adapt budget rules & AI prompts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Quick Picker Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Select Active Financial Persona:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {personas.map((p) => {
              const Icon = p.icon;
              const isSelected = profileType === p.type;
              return (
                <div
                  key={p.type}
                  onClick={() => {
                    setProfileType(p.type);
                    setIncome(p.sampleIncome.toString());
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500/50 shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">{p.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Monthly Inflow / Baseline
              </label>
              <input
                type="number"
                required
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none font-mono-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onSwitchProfileQuick(profileType)}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium"
            >
              Seed Profile Demo &rarr;
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
