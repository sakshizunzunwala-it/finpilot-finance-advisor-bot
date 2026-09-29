/**
 * FinPilot Vanilla JavaScript Client
 * Manages UI tabs, API synchronization, chat widget, modals, and toasts.
 */

let state = {
  user: {
    name: "Alex Morgan",
    profile_type: "Salaried Professional",
    monthly_income: 75000,
    currency: "₹"
  },
  incomes: [],
  expenses: [],
  goals: [],
  budget: null,
  activeTab: "dashboard",
  report: null
};

// Initializer
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupChat();
  setupModals();
  setupThemeToggle();
  await loadUserData();
});

// Toast notification helper
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  const bg = type === "success" ? "bg-emerald-600 text-white" : type === "error" ? "bg-rose-600 text-white" : "bg-violet-600 text-white";
  toast.className = `${bg} px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 transform transition-all duration-300`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Navigation & Tab Switching
function setupNavigation() {
  document.querySelectorAll("#sidebar-nav .nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#sidebar-nav .nav-btn").forEach(b => {
        b.classList.remove("active-nav", "bg-violet-600/15", "text-violet-300", "border", "border-violet-500/20");
        b.classList.add("text-slate-400");
      });
      btn.classList.add("active-nav", "bg-violet-600/15", "text-violet-300", "border", "border-violet-500/20");
      btn.classList.remove("text-slate-400");
      const tab = btn.getAttribute("data-tab");
      state.activeTab = tab;
      renderCurrentView();
    });
  });

  const demoBtn = document.getElementById("btn-load-demo");
  if (demoBtn) {
    demoBtn.addEventListener("click", async () => {
      demoBtn.disabled = true;
      demoBtn.innerHTML = "<span>⏳</span> Seeding Data...";
      try {
        const res = await fetch("/api/demo-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_type: state.user.profile_type })
        });
        if (res.ok) {
          showToast("Realistic demo data loaded successfully!", "success");
          await loadUserData();
        }
      } catch (e) {
        showToast("Error loading demo data", "error");
      } finally {
        demoBtn.disabled = false;
        demoBtn.innerHTML = "<span>✨</span> Load Demo Data";
      }
    });
  }
}

// API Fetch and sync
async function loadUserData() {
  try {
    const [uRes, incRes, expRes, gRes, bRes] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/income"),
      fetch("/api/expenses"),
      fetch("/api/goals"),
      fetch("/api/budget")
    ]);

    if (uRes.ok) state.user = await uRes.json();
    if (incRes.ok) state.incomes = await incRes.json();
    if (expRes.ok) state.expenses = await expRes.json();
    if (gRes.ok) state.goals = await gRes.json();
    if (bRes.ok) state.budget = await bRes.json();

    // Update Header Badges
    document.getElementById("user-display-name").innerText = state.user.name;
    document.getElementById("user-display-profile").innerText = state.user.profile_type;
    document.getElementById("persona-badge").innerText = state.user.profile_type;

    renderCurrentView();
  } catch (err) {
    console.error("Failed to load user data:", err);
  }
}

// Render dynamic views based on tab
function renderCurrentView() {
  const container = document.getElementById("view-container");
  const titleElem = document.getElementById("current-view-title");
  if (!container) return;

  const currency = state.user.currency || "₹";
  const totalIncome = state.incomes.reduce((acc, i) => acc + (parseFloat(i.amount) || 0), 0) || state.user.monthly_income;
  const totalSpent = state.expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const remaining = totalIncome - totalSpent;
  const daysInMonth = 30;
  const todayDate = new Date().getDate();
  const daysLeft = Math.max(1, daysInMonth - todayDate);
  const safeSpendToday = Math.max(0, Math.round(remaining / daysLeft));

  if (state.activeTab === "dashboard") {
    titleElem.innerText = "Financial Dashboard";
    renderDashboardView(container, { currency, totalIncome, totalSpent, remaining, safeSpendToday });
  } else if (state.activeTab === "income") {
    titleElem.innerText = "Income Streams";
    renderIncomeView(container, { currency, totalIncome });
  } else if (state.activeTab === "expenses") {
    titleElem.innerText = "Expense Ledger";
    renderExpensesView(container, { currency, totalSpent });
  } else if (state.activeTab === "budget") {
    titleElem.innerText = "AI Budget Plan";
    renderBudgetView(container, { currency });
  } else if (state.activeTab === "goals") {
    titleElem.innerText = "Financial Goals";
    renderGoalsView(container, { currency });
  } else if (state.activeTab === "report") {
    titleElem.innerText = "Monthly Summary Report";
    renderReportView(container, { currency, totalIncome, totalSpent, remaining });
  } else if (state.activeTab === "advisor") {
    titleElem.innerText = "AI Chat Advisor";
    renderAdvisorFullView(container);
  }
}

// View: Dashboard
function renderDashboardView(container, { currency, totalIncome, totalSpent, remaining, safeSpendToday }) {
  // Aggregate category spent
  const categoryTotals = {};
  state.expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
  });

  const savingsRate = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;
  const healthScore = Math.min(100, Math.max(25, 45 + Math.round(savingsRate * 0.5) + (state.goals.length * 6)));

  container.innerHTML = `
    <!-- Hero Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Safe to Spend Animated Hero Card -->
      <div class="lg:col-span-2 relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-900/40 via-slate-900/60 to-indigo-950/40 border border-violet-500/20 backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold tracking-wider uppercase text-violet-300">Daily Spending Cushion</span>
            <h2 class="text-2xl font-bold text-white mt-1">Safe to Spend Today</h2>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            ${state.user.profile_type} Blueprint
          </span>
        </div>

        <div class="my-6">
          <div class="flex items-baseline gap-2">
            <span class="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">${currency}${safeSpendToday.toLocaleString()}</span>
            <span class="text-xs text-slate-400">/ day allocated</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Calculated from ${currency}${remaining.toLocaleString()} uncommitted reserves over next days.</p>
        </div>

        <div class="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4">
          <div>
            <p class="text-[11px] text-slate-400">Monthly Inflow</p>
            <p class="text-sm font-semibold text-emerald-400 tabular-nums">${currency}${totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-400">Total Spent</p>
            <p class="text-sm font-semibold text-rose-400 tabular-nums">${currency}${totalSpent.toLocaleString()}</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-400">Current Surplus</p>
            <p class="text-sm font-semibold text-violet-300 tabular-nums">${currency}${remaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <!-- Financial Health Score Gauge Card -->
      <div class="rounded-2xl p-6 glass-box border border-slate-800/80 flex flex-col items-center justify-between text-center">
        <div class="w-full flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-200">Financial Health Score</h3>
          <span class="text-xs text-emerald-400 font-medium">Top 15%</span>
        </div>

        <div class="relative my-4 flex items-center justify-center">
          <div class="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
            <div class="text-center">
              <span class="text-3xl font-bold text-white tabular-nums">${healthScore}</span>
              <span class="text-[10px] block text-slate-400">out of 100</span>
            </div>
          </div>
        </div>

        <div class="text-xs text-slate-400">
          <span class="text-emerald-400 font-semibold">${savingsRate}% Savings Rate</span> · ${state.goals.length} Goals on Track
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Category Donut -->
      <div class="rounded-2xl p-5 glass-box border border-slate-800/80">
        <h3 class="text-sm font-semibold text-slate-200 mb-3">Expenses by Category</h3>
        <div class="h-64 relative">
          <canvas id="category-donut-canvas"></canvas>
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="rounded-2xl p-5 glass-box border border-slate-800/80">
        <h3 class="text-sm font-semibold text-slate-200 mb-3">6-Month Trend Overview</h3>
        <div class="h-64 relative">
          <canvas id="trend-line-canvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Active Goals Progress Preview -->
    <div class="rounded-2xl p-5 glass-box border border-slate-800/80 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-200">Active Goals Progress</h3>
        <button onclick="document.querySelector('[data-tab=goals]').click()" class="text-xs text-violet-400 hover:underline">View All &rarr;</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${state.goals.map(g => {
          const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
          return `
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-slate-200">${g.title}</span>
                <span class="text-violet-400 font-mono">${pct}%</span>
              </div>
              <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all" style="width: ${pct}%"></div>
              </div>
              <div class="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>${currency}${g.current_amount.toLocaleString()}</span>
                <span>${currency}${g.target_amount.toLocaleString()}</span>
              </div>
            </div>
          `;
        }).join('') || '<p class="text-xs text-slate-400 col-span-3">No active goals yet. Click Goals to create one!</p>'}
      </div>
    </div>
  `;

  // Render Charts
  setTimeout(() => {
    renderCategoryDonut("category-donut-canvas", categoryTotals);
    renderIncomeExpenseTrend("trend-line-canvas", [
      { month: "Apr", income: totalIncome * 0.9, expense: totalSpent * 0.85 },
      { month: "May", income: totalIncome * 0.95, expense: totalSpent * 0.9 },
      { month: "Jun", income: totalIncome, expense: totalSpent * 0.95 },
      { month: "Jul", income: totalIncome * 1.05, expense: totalSpent * 1.05 },
      { month: "Aug", income: totalIncome, expense: totalSpent * 0.92 },
      { month: "Sep", income: totalIncome, expense: totalSpent }
    ]);
  }, 50);
}

// View: Income
function renderIncomeView(container, { currency, totalIncome }) {
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-white">Income Sources</h2>
        <p class="text-xs text-slate-400">Total Inflow: ${currency}${totalIncome.toLocaleString()} / month</p>
      </div>
      <button id="add-income-btn" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all">
        + Add Income Stream
      </button>
    </div>

    <div class="rounded-2xl glass-box border border-slate-800 overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-900/90 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3.5">Source / Client</th>
            <th class="p-3.5">Type</th>
            <th class="p-3.5">Date</th>
            <th class="p-3.5 text-right">Amount</th>
            <th class="p-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 text-slate-300 font-mono">
          ${state.incomes.map(i => `
            <tr class="hover:bg-slate-900/40">
              <td class="p-3.5 font-sans font-medium text-white">${i.source} ${i.client_name ? `<span class="text-xs text-violet-400">(${i.client_name})</span>` : ''}</td>
              <td class="p-3.5 capitalize font-sans">${i.income_type} · ${i.frequency}</td>
              <td class="p-3.5">${i.date_received || '-'}</td>
              <td class="p-3.5 text-right font-bold text-emerald-400">${currency}${parseFloat(i.amount).toLocaleString()}</td>
              <td class="p-3.5 text-center">
                <button onclick="deleteIncome(${i.id})" class="text-rose-400 hover:text-rose-300">✕</button>
              </td>
            </tr>
          `).join('') || `<tr><td colspan="5" class="p-6 text-center text-slate-500 font-sans">No income entries logged yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("add-income-btn")?.addEventListener("click", () => {
    const src = prompt("Income Source Name (e.g. Salary, Client Retainer):");
    if (!src) return;
    const amt = prompt("Amount:");
    if (!amt) return;
    const client = prompt("Client / Employer (optional):") || "";

    fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: src, amount: amt, client_name: client, income_type: "fixed" })
    }).then(() => {
      showToast("Income added successfully!", "success");
      loadUserData();
    });
  });
}

// View: Expenses
function renderExpensesView(container, { currency, totalSpent }) {
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-white">Expense Ledger</h2>
        <p class="text-xs text-slate-400">Total Spent: ${currency}${totalSpent.toLocaleString()}</p>
      </div>
      <button onclick="openExpenseModal()" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all">
        + Log Expense
      </button>
    </div>

    <div class="rounded-2xl glass-box border border-slate-800 overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-900/90 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3.5">Category</th>
            <th class="p-3.5">Note</th>
            <th class="p-3.5">Date</th>
            <th class="p-3.5 text-right">Amount</th>
            <th class="p-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 text-slate-300 font-mono">
          ${state.expenses.map(e => `
            <tr class="hover:bg-slate-900/40">
              <td class="p-3.5 font-sans font-medium text-white">${e.category}</td>
              <td class="p-3.5 font-sans text-slate-400">${e.note || '-'}</td>
              <td class="p-3.5">${e.date_incurred || '-'}</td>
              <td class="p-3.5 text-right font-bold text-rose-400">${currency}${parseFloat(e.amount).toLocaleString()}</td>
              <td class="p-3.5 text-center">
                <button onclick="editExpense(${e.id})" class="text-violet-400 hover:text-violet-300 mr-2">✎</button>
                <button onclick="deleteExpense(${e.id})" class="text-rose-400 hover:text-rose-300">✕</button>
              </td>
            </tr>
          `).join('') || `<tr><td colspan="5" class="p-6 text-center text-slate-500 font-sans">No expenses logged yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

// View: Budget Plan
function renderBudgetView(container, { currency }) {
  const plan = state.budget?.plan_data || {};
  const alloc = plan.allocations || { needs: { percentage: 50 }, wants: { percentage: 30 }, savings: { percentage: 20 } };
  const limits = plan.category_limits || {};
  const alerts = plan.overspending_alerts || [];

  container.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-white">AI-Adapted Budget Plan</h2>
        <p class="text-xs text-slate-400">Tailored 50/30/20 framework for ${state.user.profile_type}</p>
      </div>
      <button id="regenerate-budget-btn" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all">
        ⚡ Regenerate with AI
      </button>
    </div>

    <!-- Strategy Note Banner -->
    <div class="p-4 rounded-xl bg-violet-950/40 border border-violet-800/40 text-xs text-violet-200">
      💡 <strong class="text-white">AI Persona Strategy:</strong> ${plan.strategy_note || "Focusing on sustainable wealth accumulation and disciplined emergency provisions."}
    </div>

    <!-- Overspending alerts if any -->
    ${alerts.length > 0 ? `
      <div class="space-y-2">
        ${alerts.map(a => `
          <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center justify-between">
            <span>⚠️ ${a.message}</span>
            <span class="font-mono text-rose-400 font-semibold">+${currency}${a.overspend?.toLocaleString()}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- 50/30/20 Breakdown Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl glass-box border border-slate-800">
        <span class="text-xs font-semibold text-slate-400">Needs & Fixed</span>
        <h3 class="text-xl font-bold text-white mt-1 tabular-nums">${alloc.needs.percentage}%</h3>
        <p class="text-xs text-slate-400 mt-1">Rent, Groceries, Utilities, Healthcare</p>
      </div>
      <div class="p-5 rounded-2xl glass-box border border-slate-800">
        <span class="text-xs font-semibold text-slate-400">Wants & Discretionary</span>
        <h3 class="text-xl font-bold text-white mt-1 tabular-nums">${alloc.wants.percentage}%</h3>
        <p class="text-xs text-slate-400 mt-1">Dining out, Entertainment, Shopping</p>
      </div>
      <div class="p-5 rounded-2xl glass-box border border-slate-800">
        <span class="text-xs font-semibold text-slate-400">Savings & Runway</span>
        <h3 class="text-xl font-bold text-emerald-400 mt-1 tabular-nums">${alloc.savings.percentage}%</h3>
        <p class="text-xs text-slate-400 mt-1">Emergency fund, investments, targets</p>
      </div>
    </div>

    <!-- Category Limits Grid -->
    <div class="rounded-2xl p-5 glass-box border border-slate-800">
      <h3 class="text-sm font-semibold text-slate-200 mb-3">Allocated Monthly Category Limits</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        ${Object.entries(limits).map(([cat, lim]) => `
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span class="text-xs text-slate-400">${cat}</span>
            <p class="text-sm font-bold text-white mt-1 font-mono">${currency}${parseFloat(lim).toLocaleString()}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById("regenerate-budget-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("regenerate-budget-btn");
    btn.disabled = true;
    btn.innerText = "Regenerating...";
    try {
      const res = await fetch("/api/budget", { method: "POST" });
      if (res.ok) {
        state.budget = await res.json();
        showToast("New AI Budget generated!", "success");
        renderCurrentView();
      }
    } finally {
      btn.disabled = false;
    }
  });
}

// View: Goals
function renderGoalsView(container, { currency }) {
  container.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-white">Target Financial Goals</h2>
        <p class="text-xs text-slate-400">Track and fund your milestones</p>
      </div>
      <button id="add-goal-btn" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all">
        + Create Goal
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${state.goals.map(g => {
        const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
        return `
          <div class="p-5 rounded-2xl glass-box border border-slate-800 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">${g.category}</span>
                <button onclick="deleteGoal(${g.id})" class="text-slate-500 hover:text-rose-400 text-sm">✕</button>
              </div>
              <h3 class="font-bold text-white text-base">${g.title}</h3>
              <p class="text-xs text-slate-400 mt-1">Target Date: ${g.deadline || '2026-12-31'}</p>
            </div>

            <div class="my-4">
              <div class="flex justify-between text-xs mb-1 font-mono">
                <span class="text-slate-300">${currency}${g.current_amount.toLocaleString()}</span>
                <span class="text-slate-500">${currency}${g.target_amount.toLocaleString()}</span>
              </div>
              <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full" style="width: ${pct}%"></div>
              </div>
              <span class="text-[11px] text-violet-400 font-mono mt-1 block text-right">${pct}% Funded</span>
            </div>

            <button onclick="contributeToGoal(${g.id})" class="w-full py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all">
              + Contribute Funds
            </button>
          </div>
        `;
      }).join('') || '<p class="text-xs text-slate-500 col-span-3">No goals created yet. Set up an emergency fund or milestone target!</p>'}
    </div>
  `;

  document.getElementById("add-goal-btn")?.addEventListener("click", () => {
    const title = prompt("Goal Title (e.g. Emergency Fund, Laptop Upgrade):");
    if (!title) return;
    const target = prompt("Target Amount:");
    if (!target) return;

    fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, target_amount: target, current_amount: 0 })
    }).then(() => {
      showToast("Goal created!", "success");
      loadUserData();
    });
  });
}

// View: Monthly Report
async function renderReportView(container, { currency, totalIncome, totalSpent, remaining }) {
  container.innerHTML = `<div class="p-8 text-center text-xs text-slate-400">Loading comprehensive monthly report...</div>`;
  
  try {
    const res = await fetch("/api/report");
    const rep = await res.json();
    state.report = rep;

    container.innerHTML = `
      <div class="flex items-center justify-between no-print">
        <div>
          <h2 class="text-lg font-bold text-white">Monthly Summary Report</h2>
          <p class="text-xs text-slate-400">Cycle: ${rep.month_year}</p>
        </div>
        <button onclick="window.print()" class="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all flex items-center gap-1.5">
          <span>🖨️</span> Download as PDF / Print
        </button>
      </div>

      <div class="printable-area space-y-6">
        <!-- AI Written Insight Card -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-violet-950/50 to-slate-900 border border-violet-700/30 text-slate-200">
          <h3 class="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1.5">AI Executive Summary</h3>
          <p class="text-sm leading-relaxed">${rep.ai_insights}</p>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 rounded-xl glass-box border border-slate-800">
            <span class="text-xs text-slate-400">Total Income</span>
            <p class="text-lg font-bold text-emerald-400 tabular-nums">${currency}${rep.total_income.toLocaleString()}</p>
          </div>
          <div class="p-4 rounded-xl glass-box border border-slate-800">
            <span class="text-xs text-slate-400">Total Outflow</span>
            <p class="text-lg font-bold text-rose-400 tabular-nums">${currency}${rep.total_expenses.toLocaleString()}</p>
          </div>
          <div class="p-4 rounded-xl glass-box border border-slate-800">
            <span class="text-xs text-slate-400">Net Surplus</span>
            <p class="text-lg font-bold text-violet-300 tabular-nums">${currency}${rep.net_savings.toLocaleString()}</p>
          </div>
          <div class="p-4 rounded-xl glass-box border border-slate-800">
            <span class="text-xs text-slate-400">Savings Rate</span>
            <p class="text-lg font-bold text-white tabular-nums">${rep.savings_rate}%</p>
          </div>
        </div>

        <!-- Future Ready Hooks -->
        <div class="p-5 rounded-2xl glass-box border border-slate-800/80 space-y-3">
          <h3 class="text-sm font-semibold text-slate-200">Future-Ready Analytics & Insights</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-[10px] text-amber-400 font-semibold uppercase">Coming Soon</span>
              <h4 class="text-xs font-bold text-white mt-1">Predictive Cashflow AI</h4>
              <p class="text-[11px] text-slate-400 mt-1">Monte Carlo forecasting for 90-day cash depletion buffer.</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-[10px] text-amber-400 font-semibold uppercase">Coming Soon</span>
              <h4 class="text-xs font-bold text-white mt-1">Smart Tax Optimization</h4>
              <p class="text-[11px] text-slate-400 mt-1">80C, NPS, and health deduction tracker tailored for ${state.user.profile_type}.</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span class="text-[10px] text-amber-400 font-semibold uppercase">Coming Soon</span>
              <h4 class="text-xs font-bold text-white mt-1">Automated SIP Allocator</h4>
              <p class="text-[11px] text-slate-400 mt-1">Zero-commission index fund and liquid gold rebalancing.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<div class="text-xs text-rose-400">Failed to generate report.</div>`;
  }
}

// View: AI Advisor Full View
function renderAdvisorFullView(container) {
  container.innerHTML = `
    <div class="max-w-3xl mx-auto space-y-4">
      <div>
        <h2 class="text-lg font-bold text-white">FinPilot AI Advisor</h2>
        <p class="text-xs text-slate-400">Direct conversational financial guidance grounded in your live income and expenses.</p>
      </div>
      <div class="p-5 rounded-2xl glass-box border border-slate-800 text-xs text-slate-300">
        You can use the floating widget on the bottom right or try these common queries:
        <ul class="mt-3 space-y-2 text-violet-400 font-medium">
          <li>• "Can I afford to purchase a ₹40,000 gadget right now?"</li>
          <li>• "How much should I keep in an emergency fund as a ${state.user.profile_type}?"</li>
          <li>• "Suggest 3 concrete areas where I can reduce spending."</li>
        </ul>
      </div>
    </div>
  `;
}

// Chat Advisor Interactions
function setupChat() {
  const toggleBtn = document.getElementById("toggle-chat-btn");
  const chatPopup = document.getElementById("chat-popup");
  const closeBtn = document.getElementById("close-chat-btn");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");

  if (!toggleBtn || !chatPopup) return;

  toggleBtn.addEventListener("click", () => {
    chatPopup.classList.toggle("hidden");
    if (!chatPopup.classList.contains("hidden")) {
      chatInput.focus();
    }
  });

  closeBtn?.addEventListener("click", () => {
    chatPopup.classList.add("hidden");
  });

  document.querySelectorAll(".chat-preset-query").forEach(btn => {
    btn.addEventListener("click", () => {
      chatInput.value = btn.innerText.replace(/^[•"\s]+|["]+$/g, "");
      chatForm.dispatchEvent(new Event("submit"));
    });
  });

  chatForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;

    // Append user message
    const userBubble = document.createElement("div");
    userBubble.className = "p-3 rounded-xl bg-violet-600 text-white text-xs max-w-[85%] self-end ml-auto";
    userBubble.innerText = q;
    chatMessages.appendChild(userBubble);
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Loading skeleton
    const botBubble = document.createElement("div");
    botBubble.className = "p-3 rounded-xl bg-slate-800 text-slate-200 text-xs max-w-[90%] space-y-1";
    botBubble.innerHTML = `<span class="animate-pulse">Analyzing your finances...</span>`;
    chatMessages.appendChild(botBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q })
      });
      const data = await res.json();
      botBubble.innerHTML = data.reply.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
      botBubble.innerText = "Sorry, I encountered an issue checking your financials. Please retry!";
    }
  });
}

// Modals Setup
function setupModals() {
  const profBtn = document.getElementById("btn-open-profile");
  const profModal = document.getElementById("profile-modal");
  const closeProf = document.getElementById("close-profile-modal");
  const cancelProf = document.getElementById("cancel-profile-btn");
  const profForm = document.getElementById("profile-form");

  profBtn?.addEventListener("click", () => {
    document.getElementById("prof-name").value = state.user.name;
    document.getElementById("prof-type").value = state.user.profile_type;
    document.getElementById("prof-income").value = state.user.monthly_income;
    document.getElementById("prof-currency").value = state.user.currency || "₹";
    profModal.classList.remove("hidden");
  });

  [closeProf, cancelProf].forEach(btn => btn?.addEventListener("click", () => profModal.classList.add("hidden")));

  profForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById("prof-name").value,
      profile_type: document.getElementById("prof-type").value,
      monthly_income: parseFloat(document.getElementById("prof-income").value),
      currency: document.getElementById("prof-currency").value
    };
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    profModal.classList.add("hidden");
    showToast("Profile settings saved!", "success");
    await loadUserData();
  });

  // Expense modal
  const expModal = document.getElementById("expense-modal");
  const closeExp = document.getElementById("close-expense-modal");
  const cancelExp = document.getElementById("cancel-expense-btn");
  const expForm = document.getElementById("expense-form");
  const quickExp = document.getElementById("quick-add-expense-btn");

  quickExp?.addEventListener("click", () => openExpenseModal());
  [closeExp, cancelExp].forEach(btn => btn?.addEventListener("click", () => expModal.classList.add("hidden")));

  expForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("exp-id").value;
    const body = {
      amount: parseFloat(document.getElementById("exp-amount").value),
      category: document.getElementById("exp-category").value,
      note: document.getElementById("exp-note").value,
      date_incurred: document.getElementById("exp-date").value
    };

    const url = id ? `/api/expenses?id=${id}` : "/api/expenses";
    const method = id ? "PUT" : "POST";

    await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    expModal.classList.add("hidden");
    showToast(id ? "Expense updated!" : "Expense logged!", "success");
    await loadUserData();
  });
}

function openExpenseModal(item = null) {
  const expModal = document.getElementById("expense-modal");
  document.getElementById("expense-modal-title").innerText = item ? "Edit Expense" : "Log Expense";
  document.getElementById("exp-id").value = item ? item.id : "";
  document.getElementById("exp-amount").value = item ? item.amount : "";
  document.getElementById("exp-category").value = item ? item.category : "Food";
  document.getElementById("exp-note").value = item ? item.note : "";
  document.getElementById("exp-date").value = item ? item.date_incurred : new Date().toISOString().split("T")[0];
  expModal.classList.remove("hidden");
}

function editExpense(id) {
  const item = state.expenses.find(e => e.id === id);
  if (item) openExpenseModal(item);
}

function deleteExpense(id) {
  if (confirm("Delete this expense entry?")) {
    fetch(`/api/expenses?id=${id}`, { method: "DELETE" }).then(() => {
      showToast("Expense removed", "info");
      loadUserData();
    });
  }
}

function deleteIncome(id) {
  if (confirm("Delete this income entry?")) {
    fetch(`/api/income?id=${id}`, { method: "DELETE" }).then(() => {
      showToast("Income entry removed", "info");
      loadUserData();
    });
  }
}

function deleteGoal(id) {
  if (confirm("Delete this goal?")) {
    fetch(`/api/goals?id=${id}`, { method: "DELETE" }).then(() => {
      showToast("Goal removed", "info");
      loadUserData();
    });
  }
}

function contributeToGoal(id) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal) return;
  const amt = prompt(`Add contribution to "${goal.title}" (${state.user.currency}):`);
  if (!amt || isNaN(amt)) return;
  const newAmt = goal.current_amount + parseFloat(amt);
  fetch(`/api/goals?id=${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_amount: newAmt })
  }).then(() => {
    showToast("Contribution recorded!", "success");
    loadUserData();
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  toggle?.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}
