import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ExpenseItem, ExpenseCategory, UserProfile } from '../types/finance';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ExpenseItem, 'id'>, id?: number) => void;
  editItem?: ExpenseItem | null;
  user: UserProfile;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food', 'Groceries', 'Rent', 'Transport', 'Utilities', 
  'Entertainment', 'Shopping', 'Education', 'Healthcare', 'Other'
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  user,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [note, setNote] = useState('');
  const [dateIncurred, setDateIncurred] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI/Card');

  useEffect(() => {
    if (editItem) {
      setAmount(editItem.amount.toString());
      setCategory(editItem.category);
      setNote(editItem.note);
      setDateIncurred(editItem.date_incurred);
      setPaymentMethod(editItem.payment_method);
    } else {
      setAmount('');
      setCategory('Food');
      setNote('');
      setDateIncurred(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI/Card');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onSave(
      {
        amount: parseFloat(amount),
        category,
        note,
        date_incurred: dateIncurred,
        payment_method: paymentMethod,
      },
      editItem?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {editItem ? 'Edit Expense Record' : 'Log New Expense'}
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
              Amount ({user.currency})
            </label>
            <input
              type="number"
              required
              step="any"
              placeholder="e.g. 1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy team lunch, Metro recharge"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateIncurred}
                onChange={(e) => setDateIncurred(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payment Method
              </label>
              <input
                type="text"
                placeholder="UPI, Card, Cash"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
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
              {editItem ? 'Save Changes' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
