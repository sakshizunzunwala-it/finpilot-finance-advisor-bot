/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  PieChart, 
  Target, 
  FileText, 
  Bot, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

import { 
  UserProfile, 
  IncomeItem, 
  ExpenseItem, 
  GoalItem, 
  BudgetPlanData, 
  MonthlyReportData, 
  SavingSuggestion,
  ProfileType 
} from './types/finance';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SafeToSpendHero } from './components/SafeToSpendHero';
import { HealthScoreGauge } from './components/HealthScoreGauge';
import { CategoryDonutChart } from './components/CategoryDonutChart';
import { TrendLineChart } from './components/TrendLineChart';
import { GoalProgressCards } from './components/GoalProgressCards';
import { AiBudgetPlanner } from './components/AiBudgetPlanner';
import { AiSavingSuggestions } from './components/AiSavingSuggestions';
import { MonthlyReportView } from './components/MonthlyReportView';
import { IncomeLedger } from './components/IncomeLedger';
import { ExpenseLedger } from './components/ExpenseLedger';
import { FutureReadyHooks } from './components/FutureReadyHooks';
import { AiChatAdvisor } from './components/AiChatAdvisor';
import { ExpenseModal } from './components/ExpenseModal';
import { ProfileModal } from './components/ProfileModal';
import { GoalModal } from './components/GoalModal';
import { PythonSourceModal } from './components/PythonSourceModal';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Core Data States
  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Morgan',
    profile_type: 'Salaried Professional',
    monthly_income: 85000,
    currency: '₹',
  });

  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlanData | null>(null);
  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [suggestions, setSuggestions] = useState<SavingSuggestion[]>([]);

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch initial app state
  const loadData = async () => {
    try {
      const [uRes, incRes, expRes, gRes, bRes, sRes, rRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/income'),
        fetch('/api/expenses'),
        fetch('/api/goals'),
        fetch('/api/budget'),
        fetch('/api/suggestions'),
        fetch('/api/report'),
      ]);

      if (uRes.ok) setUser(await uRes.json());
      if (incRes.ok) setIncomes(await incRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (gRes.ok) setGoals(await gRes.json());
      if (bRes.ok) {
        const bData = await bRes.json();
        setBudgetPlan(bData.plan_data);
      }
      if (sRes.ok) setSuggestions(await sRes.json());
      if (rRes.ok) setReport(await rRes.json());
    } catch (e) {
      console.warn('API sync fallback to local cache:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived financial math
  const totalIncome =
    incomes.reduce((acc, i) => acc + i.amount, 0) || user.monthly_income;
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remainingBuffer = totalIncome - totalSpent;
  const daysInMonth = 30;
  const today = new Date().getDate();
  const daysLeft = Math.max(1, daysInMonth - today);
  const safeSpendToday = Math.max(0, Math.round(remainingBuffer / daysLeft));
  const savingsRate =
    totalIncome > 0 ? Math.round((remainingBuffer / totalIncome) * 100) : 0;

  let calculatedHealthScore = 78;
  if (savingsRate >= 25) calculatedHealthScore = 88;
  else if (savingsRate >= 15) calculatedHealthScore = 76;
  else if (savingsRate > 0) calculatedHealthScore = 64;
  else calculatedHealthScore = 42;

  // Actions
  const handleLoadDemoData = async (profileType?: ProfileType) => {
    setIsLoadingDemo(true);
    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_type: profileType || user.profile_type }),
      });
      if (res.ok) {
        await loadData();
        showToast(
          `Demo data successfully loaded for ${profileType || user.profile_type}!`,
          'success'
        );
      }
    } catch {
      showToast('Error seeding demo data', 'error');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleSaveExpense = async (
    item: Omit<ExpenseItem, 'id'>,
    id?: number
  ) => {
    try {
      const url = id ? `/api/expenses?id=${id}` : '/api/expenses';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        showToast(id ? 'Expense updated' : 'Expense logged', 'success');
        await loadData();
      }
    } catch {
      showToast('Error saving expense', 'error');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Expense removed', 'info');
        await loadData();
      }
    } catch {
      showToast('Error removing expense', 'error');
    }
  };

  const handleAddIncome = async (item: Omit<IncomeItem, 'id'>) => {
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        showToast('Income stream recorded', 'success');
        await loadData();
      }
    } catch {
      showToast('Error recording income', 'error');
    }
  };

  const handleDeleteIncome = async (id: number) => {
    try {
      const res = await fetch(`/api/income?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Income entry removed', 'info');
        await loadData();
      }
    } catch {
      showToast('Error removing income', 'error');
    }
  };

  const handleSaveGoal = async (goal: Omit<GoalItem, 'id'>) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        showToast('Target goal established', 'success');
        await loadData();
      }
    } catch {
      showToast('Error creating goal', 'error');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Goal removed', 'info');
        await loadData();
      }
    } catch {
      showToast('Error deleting goal', 'error');
    }
  };

  const handleContributeGoal = async (goalId: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const input = prompt(
      `Enter contribution amount for "${goal.title}" (${user.currency}):`,
      '5000'
    );
    if (!input || isNaN(parseFloat(input))) return;

    const added = parseFloat(input);
    try {
      const res = await fetch(`/api/goals?id=${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_amount: goal.current_amount + added }),
      });
      if (res.ok) {
        showToast(`Allocated ${user.currency}${added.toLocaleString()} to goal!`, 'success');
        await loadData();
      }
    } catch {
      showToast('Error saving contribution', 'error');
    }
  };

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        showToast('Profile configuration updated', 'success');
        await loadData();
      }
    } catch {
      showToast('Error updating profile', 'error');
    }
  };

  const handleRefreshBudget = async (useAi: boolean) => {
    try {
      const res = await fetch(`/api/budget?ai=${useAi}`);
      if (res.ok) {
        const data = await res.json();
        setBudgetPlan(data.plan_data);
        showToast('Budget regenerated with AI optimization', 'success');
      }
    } catch {
      showToast('Failed to regenerate budget', 'error');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0b101b] text-slate-100' : 'bg-slate-50 text-slate-900'} antialiased selection:bg-violet-500/30 selection:text-violet-200 transition-colors duration-200`}>
      {/* Top Header */}
      <Header
        user={user}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenExpenseModal={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenPythonFiles={() => setIsPythonModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLoadDemoData={handleLoadDemoData}
          isLoadingDemo={isLoadingDemo}
        />

        {/* Main Workspace Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-8">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Hero + Health Score Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <SafeToSpendHero
                      user={user}
                      totalIncome={totalIncome}
                      totalSpent={totalSpent}
                      remainingBuffer={remainingBuffer}
                      safeSpendToday={safeSpendToday}
                      onOpenExpenseModal={() => {
                        setEditingExpense(null);
                        setIsExpenseModalOpen(true);
                      }}
                    />
                  </div>
                  <div>
                    <HealthScoreGauge
                      user={user}
                      score={calculatedHealthScore}
                      savingsRate={savingsRate}
                      goals={goals}
                    />
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CategoryDonutChart expenses={expenses} user={user} />
                  <TrendLineChart
                    user={user}
                    totalIncome={totalIncome}
                    totalSpent={totalSpent}
                  />
                </div>

                {/* Target Goals Summary Preview */}
                <GoalProgressCards
                  goals={goals}
                  user={user}
                  onContribute={handleContributeGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onOpenAddGoal={() => setIsGoalModalOpen(true)}
                />

                {/* AI Recommendations */}
                <AiSavingSuggestions suggestions={suggestions} />

                {/* Future-Ready Intelligence Hooks */}
                <FutureReadyHooks user={user} />
              </div>
            )}

            {/* VIEW 2: INCOME */}
            {activeTab === 'income' && (
              <div className="animate-in fade-in duration-300">
                <IncomeLedger
                  incomes={incomes}
                  user={user}
                  onAddIncome={handleAddIncome}
                  onDeleteIncome={handleDeleteIncome}
                />
              </div>
            )}

            {/* VIEW 3: EXPENSES */}
            {activeTab === 'expenses' && (
              <div className="animate-in fade-in duration-300">
                <ExpenseLedger
                  expenses={expenses}
                  user={user}
                  onOpenAddModal={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  onEditExpense={(item) => {
                    setEditingExpense(item);
                    setIsExpenseModalOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                />
              </div>
            )}

            {/* VIEW 4: BUDGET PLAN */}
            {activeTab === 'budget' && (
              <div className="animate-in fade-in duration-300">
                <AiBudgetPlanner
                  budgetPlan={budgetPlan}
                  user={user}
                  expenses={expenses}
                  onRefreshBudget={handleRefreshBudget}
                />
              </div>
            )}

            {/* VIEW 5: GOALS */}
            {activeTab === 'goals' && (
              <div className="animate-in fade-in duration-300">
                <GoalProgressCards
                  goals={goals}
                  user={user}
                  onContribute={handleContributeGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onOpenAddGoal={() => setIsGoalModalOpen(true)}
                />
              </div>
            )}

            {/* VIEW 6: SUMMARY REPORT */}
            {activeTab === 'report' && (
              <div className="animate-in fade-in duration-300">
                {report ? (
                  <MonthlyReportView report={report} />
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Generating monthly diagnostic audit...
                  </div>
                )}
              </div>
            )}

            {/* VIEW 7: AI ADVISOR FULL VIEW */}
            {activeTab === 'advisor' && (
              <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-violet-400" />
                    FinPilot AI Financial Advisor
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct access to our Gemini AI financial model configured with live parameters from your profile.
                  </p>
                </div>

                <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    Persona-Specific Diagnostic Context
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-nums">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-sans block">Persona</span>
                      <strong className="text-violet-300 text-xs font-sans">{user.profile_type}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-sans block">Inflow</span>
                      <strong className="text-emerald-400">{user.currency}{totalIncome.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-sans block">Discretionary</span>
                      <strong className="text-violet-300">{user.currency}{remainingBuffer.toLocaleString()}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-sans block">Health</span>
                      <strong className="text-white">{calculatedHealthScore} / 100</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    You can interact via the floating widget at the bottom right. Try asking questions such as:
                  </p>
                  <ul className="text-xs space-y-2 text-violet-400 font-medium">
                    <li className="cursor-pointer hover:underline">• "Can I afford a ₹40,000 phone this month?"</li>
                    <li className="cursor-pointer hover:underline">• "How should I structure my emergency buffer as a {user.profile_type}?"</li>
                    <li className="cursor-pointer hover:underline">• "Where am I burning the highest percentage of unallocated cash?"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating AI Chat Advisor Widget */}
      <AiChatAdvisor user={user} />

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-around px-2 z-40">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'income', label: 'Income', icon: Wallet },
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'budget', label: 'Budget', icon: PieChart },
          { id: 'report', label: 'Report', icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
                isActive ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editItem={editingExpense}
        user={user}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
        onSwitchProfileQuick={(type) => {
          handleLoadDemoData(type);
          setIsProfileModalOpen(false);
        }}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSaveGoal={handleSaveGoal}
        user={user}
      />

      <PythonSourceModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />

      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-violet-600 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <Info className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
