import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { GoalItem, UserProfile } from '../types/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: Omit<GoalItem, 'id'>) => void;
  user: UserProfile;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
  user,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('2027-06-30');
  const [category, setCategory] = useState<'Emergency' | 'Savings' | 'Purchase' | 'Travel' | 'General'>('Emergency');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    onSaveGoal({
      title,
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount) || 0,
      deadline,
      category,
      icon: category === 'Emergency' ? 'Shield' : category === 'Travel' ? 'Plane' : 'Target',
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-400" />
            Set New Financial Goal
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Goal Milestone Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 6-Month Emergency Runway, New Laptop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target ({user.currency})
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 200000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none font-mono-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Already Saved ({user.currency})
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none font-mono-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="Emergency">Emergency Runway</option>
                <option value="Savings">General Wealth / Savings</option>
                <option value="Purchase">Major Purchase</option>
                <option value="Travel">Vacation / Travel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
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
              Establish Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
