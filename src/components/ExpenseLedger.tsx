import React, { useState } from 'react';
import { Receipt, Plus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { ExpenseItem, ExpenseCategory, UserProfile } from '../types/finance';

interface ExpenseLedgerProps {
  expenses: ExpenseItem[];
  user: UserProfile;
  onOpenAddModal: () => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: number) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food', 'Groceries', 'Rent', 'Transport', 'Utilities', 
  'Entertainment', 'Shopping', 'Education', 'Healthcare', 'Other'
];

export const ExpenseLedger: React.FC<ExpenseLedgerProps> = ({
  expenses,
  user,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFiltered = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            Expense Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Outflow Logged: <strong className="text-rose-400 font-mono-nums">{user.currency}{totalFiltered.toLocaleString()}</strong> ({filteredExpenses.length} transactions)
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description / Note</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-nums">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-sans font-medium text-white">
                    <span className="px-2.5 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-800 text-slate-200">
                      {e.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans text-slate-300">
                    {e.note || <span className="text-slate-500 italic">No notes</span>}
                  </td>
                  <td className="p-3.5 text-slate-400">{e.date_incurred}</td>
                  <td className="p-3.5 font-sans text-slate-400">{e.payment_method}</td>
                  <td className="p-3.5 text-right font-bold text-rose-400">
                    -{user.currency}{e.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center font-sans">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditExpense(e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                        title="Edit entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(e.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No expense records matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
