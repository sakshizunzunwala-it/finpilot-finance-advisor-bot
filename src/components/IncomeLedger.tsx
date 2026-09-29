import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Building, Calendar, DollarSign } from 'lucide-react';
import { IncomeItem, UserProfile } from '../types/finance';

interface IncomeLedgerProps {
  incomes: IncomeItem[];
  user: UserProfile;
  onAddIncome: (item: Omit<IncomeItem, 'id'>) => void;
  onDeleteIncome: (id: number) => void;
}

export const IncomeLedger: React.FC<IncomeLedgerProps> = ({
  incomes,
  user,
  onAddIncome,
  onDeleteIncome,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [source, setSource] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState<'fixed' | 'variable'>('fixed');
  const [frequency, setFrequency] = useState<'monthly' | 'one-time' | 'project-based'>('monthly');
  const [dateReceived, setDateReceived] = useState(new Date().toISOString().split('T')[0]);

  const totalInflow = incomes.reduce((acc, i) => acc + i.amount, 0) || user.monthly_income;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount) return;

    onAddIncome({
      source,
      client_name: clientName || undefined,
      amount: parseFloat(amount),
      income_type: incomeType,
      frequency,
      date_received: dateReceived,
    });

    setSource('');
    setClientName('');
    setAmount('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Income Streams & Inflows
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total Inflow: <strong className="text-emerald-400 font-mono-nums">{user.currency}{totalInflow.toLocaleString()}</strong> / month
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Income Stream'}</span>
        </button>
      </div>

      {/* Inline Form to add income */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-white">Record New Inflow</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Source Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Primary Salary, UX Design Project"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Client / Company (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp, Upwork Client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Amount ({user.currency})
              </label>
              <input
                type="number"
                required
                step="any"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Income Nature
              </label>
              <select
                value={incomeType}
                onChange={(e) => setIncomeType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="fixed">Fixed (Salary / Retainer)</option>
                <option value="variable">Variable (Freelance / Bonus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="project-based">Project Milestone</option>
                <option value="one-time">One-Time Inflow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date Received
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-medium rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
            >
              Save Inflow
            </button>
          </div>
        </form>
      )}

      {/* Incomes Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Source / Client</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Frequency</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-nums">
              {incomes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-sans font-medium text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span>{item.source}</span>
                        {item.client_name && (
                          <span className="block text-[11px] text-violet-400 font-sans">
                            Client: {item.client_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 capitalize font-sans text-slate-300">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] ${
                        item.income_type === 'fixed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      }`}
                    >
                      {item.income_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-sans capitalize text-slate-400">
                    {item.frequency}
                  </td>
                  <td className="p-3.5 text-slate-400">{item.date_received}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">
                    +{user.currency}{item.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onDeleteIncome(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {incomes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    No active income sources recorded. Click "Add Income Stream" above.
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
