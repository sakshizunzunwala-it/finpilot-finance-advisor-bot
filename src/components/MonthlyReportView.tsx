import React from 'react';
import { Printer, FileText, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { MonthlyReportData } from '../types/finance';

interface MonthlyReportViewProps {
  report: MonthlyReportData;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ report }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls (Hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            Executive Monthly Summary
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Reporting Period: <span className="text-slate-200 font-mono-nums">{report.month_year}</span>
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Download as PDF / Print</span>
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="printable-area p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800/80 space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              FinPilot Intelligence Report
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-0.5">
              Personal Wealth & Cashflow Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Prepared for: <strong className="text-slate-200">{report.profile_type}</strong> · Cycle {report.month_year}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Health Rating</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono-nums">
              {report.health_score} / 100
            </span>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-indigo-950/40 border border-violet-500/25 text-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-violet-300 font-semibold text-xs">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Executive Synthesis</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-100">
            {report.ai_insights}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400">Total Income</span>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono-nums mt-1">
              {report.currency}{report.total_income.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400">Total Expenses</span>
            <p className="text-lg sm:text-xl font-bold text-rose-400 font-mono-nums mt-1">
              {report.currency}{report.total_expenses.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400">Net Surplus Saved</span>
            <p className="text-lg sm:text-xl font-bold text-violet-300 font-mono-nums mt-1">
              {report.currency}{report.net_savings.toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-xs text-slate-400">Net Savings Velocity</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono-nums mt-1 flex items-center gap-1">
              <span>{report.savings_rate}%</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">
            Category Spending Distribution
          </h3>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Amount Spent</th>
                  <th className="p-3 text-right">Share of Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-nums">
                {Object.entries(report.category_summary).map(([cat, amt]) => {
                  const share = report.total_expenses > 0 ? Math.round((amt / report.total_expenses) * 100) : 0;
                  return (
                    <tr key={cat} className="hover:bg-slate-900/30">
                      <td className="p-3 font-sans text-slate-200 font-medium">{cat}</td>
                      <td className="p-3 text-right text-slate-300">
                        {report.currency}{amt.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-violet-400 font-bold">{share}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goal Milestone Progress */}
        <div className="space-y-3 border-t border-slate-800/80 pt-5">
          <h3 className="text-sm font-bold text-white">Active Milestone Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
              return (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-200 truncate">{g.title}</span>
                    <span className="text-emerald-400 font-mono-nums">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono-nums">
                    <span>{report.currency}{g.current_amount.toLocaleString()}</span>
                    <span>{report.currency}{g.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
