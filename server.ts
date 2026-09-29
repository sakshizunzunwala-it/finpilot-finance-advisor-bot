import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google Gemini API on server side
const apiKey = process.env.GEMINI_API_KEY || "";
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-Memory Storage for Full-Stack App State
interface UserProfile {
  name: string;
  profile_type: string;
  monthly_income: number;
  currency: string;
}

interface IncomeItem {
  id: number;
  source: string;
  client_name?: string;
  amount: number;
  income_type: string;
  frequency: string;
  date_received: string;
}

interface ExpenseItem {
  id: number;
  amount: number;
  category: string;
  date_incurred: string;
  note: string;
  payment_method: string;
}

interface GoalItem {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
  icon: string;
}

let userProfile: UserProfile = {
  name: "Alex Morgan",
  profile_type: "Salaried Professional",
  monthly_income: 85000,
  currency: "₹",
};

let incomes: IncomeItem[] = [
  {
    id: 1,
    source: "Senior Engineer Salary",
    client_name: "Fintech Corp",
    amount: 85000,
    income_type: "fixed",
    frequency: "monthly",
    date_received: "2026-09-01",
  },
  {
    id: 2,
    source: "Tech Advisory Retainer",
    client_name: "Substack Tech",
    amount: 15000,
    income_type: "variable",
    frequency: "monthly",
    date_received: "2026-09-12",
  },
];

let expenses: ExpenseItem[] = [
  {
    id: 1,
    amount: 25000,
    category: "Rent",
    date_incurred: "2026-09-02",
    note: "Apartment Rent & Maintenance",
    payment_method: "Net Banking",
  },
  {
    id: 2,
    amount: 9500,
    category: "Food",
    date_incurred: "2026-09-05",
    note: "Gourmet dining & weekend dinners",
    payment_method: "UPI",
  },
  {
    id: 3,
    amount: 8200,
    category: "Groceries",
    date_incurred: "2026-09-08",
    note: "Monthly pantry & fresh farm produce",
    payment_method: "UPI",
  },
  {
    id: 4,
    amount: 4800,
    category: "Transport",
    date_incurred: "2026-09-10",
    note: "Fuel & Metro smart card recharge",
    payment_method: "Card",
  },
  {
    id: 5,
    amount: 3500,
    category: "Utilities",
    date_incurred: "2026-09-14",
    note: "Broadband, Power & Water utility",
    payment_method: "UPI",
  },
  {
    id: 6,
    amount: 6200,
    category: "Entertainment",
    date_incurred: "2026-09-18",
    note: "Live music gig & streaming subscriptions",
    payment_method: "Card",
  },
  {
    id: 7,
    amount: 4500,
    category: "Shopping",
    date_incurred: "2026-09-22",
    note: "Books, tech gadgets & apparel",
    payment_method: "Card",
  },
  {
    id: 8,
    amount: 2500,
    category: "Healthcare",
    date_incurred: "2026-09-24",
    note: "Gym membership & wellness supplements",
    payment_method: "UPI",
  },
];

let goals: GoalItem[] = [
  {
    id: 1,
    title: "6-Month Emergency Runway",
    target_amount: 250000,
    current_amount: 165000,
    deadline: "2027-02-28",
    category: "Emergency",
    icon: "Shield",
  },
  {
    id: 2,
    title: "Japan Autumn Trip",
    target_amount: 180000,
    current_amount: 85000,
    deadline: "2027-10-15",
    category: "Travel",
    icon: "Plane",
  },
  {
    id: 3,
    title: "Down Payment Wealth Pool",
    target_amount: 500000,
    current_amount: 195000,
    deadline: "2028-04-01",
    category: "Savings",
    icon: "Home",
  },
];

let nextId = 100;

// Helper: Rule-Based Fallback Budget
function calculateRuleBudget(
  profile: string,
  income: number,
  currency: string,
  expList: ExpenseItem[]
) {
  let needsPct = 0.5,
    wantsPct = 0.3,
    savePct = 0.2;
  let strategy = "Salaried 50/30/20 Wealth Builder: Automated SIP and emergency buffer.";
  let catWeights: Record<string, number> = {
    Rent: 0.28,
    Food: 0.15,
    Groceries: 0.12,
    Transport: 0.08,
    Utilities: 0.07,
    Entertainment: 0.1,
    Shopping: 0.08,
    Healthcare: 0.05,
    Other: 0.07,
  };

  if (profile === "College Student") {
    needsPct = 0.55;
    wantsPct = 0.3;
    savePct = 0.15;
    strategy =
      "Student Allowance Plan: Low-cost meal sharing, campus transit discount, and emergency safety reserve.";
    catWeights = {
      Food: 0.32,
      Education: 0.22,
      Transport: 0.12,
      Entertainment: 0.1,
      Shopping: 0.08,
      Utilities: 0.04,
      Other: 0.12,
    };
  } else if (profile === "Freelancer") {
    needsPct = 0.45;
    wantsPct = 0.25;
    savePct = 0.3;
    strategy =
      "Freelancer Buffer: Aggressive 30% savings allocated for 6-month lean runway and quarterly tax reserves.";
    catWeights = {
      Rent: 0.25,
      Groceries: 0.15,
      Utilities: 0.1,
      Healthcare: 0.08,
      Food: 0.12,
      Transport: 0.08,
      Shopping: 0.07,
      Other: 0.15,
    };
  } else if (profile === "Household Manager") {
    needsPct = 0.6;
    wantsPct = 0.2;
    savePct = 0.2;
    strategy =
      "Family Household: Bulk pantry procurement, disciplined utility usage caps, and shared family sinking fund.";
    catWeights = {
      Groceries: 0.26,
      Rent: 0.24,
      Utilities: 0.14,
      Healthcare: 0.1,
      Education: 0.1,
      Transport: 0.08,
      Other: 0.08,
    };
  }

  const limits: Record<string, number> = {};
  for (const [k, v] of Object.entries(catWeights)) {
    limits[k] = Math.round(income * v);
  }

  // Check overspending
  const catSpent: Record<string, number> = {};
  expList.forEach((e) => {
    catSpent[e.category] = (catSpent[e.category] || 0) + e.amount;
  });

  const alerts: Array<{
    category: string;
    spent: number;
    limit: number;
    overspend: number;
    message: string;
  }> = [];

  for (const [cat, spent] of Object.entries(catSpent)) {
    const limit = limits[cat] || income * 0.1;
    if (spent > limit) {
      const diff = spent - limit;
      alerts.push({
        category: cat,
        spent,
        limit,
        overspend: diff,
        message: `Exceeded budget limit in ${cat} by ${currency}${diff.toLocaleString()} (${Math.round((spent / limit) * 100)}% of ceiling).`,
      });
    }
  }

  return {
    monthly_income: income,
    profile_type: profile,
    currency,
    allocations: {
      needs: { percentage: Math.round(needsPct * 100), amount: Math.round(income * needsPct) },
      wants: { percentage: Math.round(wantsPct * 100), amount: Math.round(income * wantsPct) },
      savings: { percentage: Math.round(savePct * 100), amount: Math.round(income * savePct) },
    },
    category_limits: limits,
    strategy_note: strategy,
    overspending_alerts: alerts,
  };
}

// ---------------- REST API ROUTES ---------------- //

app.get("/api/profile", (req, res) => {
  res.json(userProfile);
});

app.put("/api/profile", (req, res) => {
  const { name, profile_type, monthly_income, currency } = req.body;
  if (name !== undefined) userProfile.name = name;
  if (profile_type !== undefined) userProfile.profile_type = profile_type;
  if (monthly_income !== undefined) userProfile.monthly_income = Number(monthly_income);
  if (currency !== undefined) userProfile.currency = currency;
  res.json(userProfile);
});

app.get("/api/income", (req, res) => {
  res.json(incomes);
});

app.post("/api/income", (req, res) => {
  const { source, client_name, amount, income_type, frequency, date_received } = req.body;
  const newIncome: IncomeItem = {
    id: nextId++,
    source: source || "Income Source",
    client_name: client_name || "",
    amount: Number(amount) || 0,
    income_type: income_type || "fixed",
    frequency: frequency || "monthly",
    date_received: date_received || new Date().toISOString().split("T")[0],
  };
  incomes.unshift(newIncome);
  res.status(201).json(newIncome);
});

app.delete("/api/income", (req, res) => {
  const id = Number(req.query.id);
  incomes = incomes.filter((i) => i.id !== id);
  res.json({ success: true });
});

app.get("/api/expenses", (req, res) => {
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const { amount, category, note, date_incurred, payment_method } = req.body;
  const newExpense: ExpenseItem = {
    id: nextId++,
    amount: Number(amount) || 0,
    category: category || "Other",
    note: note || "",
    date_incurred: date_incurred || new Date().toISOString().split("T")[0],
    payment_method: payment_method || "UPI/Card",
  };
  expenses.unshift(newExpense);
  res.status(201).json(newExpense);
});

app.put("/api/expenses", (req, res) => {
  const id = Number(req.query.id);
  const { amount, category, note, date_incurred } = req.body;
  const item = expenses.find((e) => e.id === id);
  if (!item) return res.status(404).json({ error: "Expense not found" });

  if (amount !== undefined) item.amount = Number(amount);
  if (category !== undefined) item.category = category;
  if (note !== undefined) item.note = note;
  if (date_incurred !== undefined) item.date_incurred = date_incurred;
  res.json(item);
});

app.delete("/api/expenses", (req, res) => {
  const id = Number(req.query.id);
  expenses = expenses.filter((e) => e.id !== id);
  res.json({ success: true });
});

app.get("/api/goals", (req, res) => {
  res.json(goals);
});

app.post("/api/goals", (req, res) => {
  const { title, target_amount, current_amount, deadline, category, icon } = req.body;
  const newGoal: GoalItem = {
    id: nextId++,
    title: title || "New Goal",
    target_amount: Number(target_amount) || 50000,
    current_amount: Number(current_amount) || 0,
    deadline: deadline || "2027-12-31",
    category: category || "Savings",
    icon: icon || "Target",
  };
  goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.put("/api/goals", (req, res) => {
  const id = Number(req.query.id);
  const { current_amount, target_amount, title } = req.body;
  const goal = goals.find((g) => g.id === id);
  if (!goal) return res.status(404).json({ error: "Goal not found" });

  if (current_amount !== undefined) goal.current_amount = Number(current_amount);
  if (target_amount !== undefined) goal.target_amount = Number(target_amount);
  if (title !== undefined) goal.title = title;
  res.json(goal);
});

app.delete("/api/goals", (req, res) => {
  const id = Number(req.query.id);
  goals = goals.filter((g) => g.id !== id);
  res.json({ success: true });
});

app.get("/api/budget", async (req, res) => {
  const totalInflow =
    incomes.reduce((acc, i) => acc + i.amount, 0) || userProfile.monthly_income;
  const rulePlan = calculateRuleBudget(
    userProfile.profile_type,
    totalInflow,
    userProfile.currency,
    expenses
  );

  // If Gemini API is available, optionally enhance plan
  if (aiClient && req.query.ai === "true") {
    try {
      const prompt = `You are FinPilot, an AI Personal Finance Advisor.
Analyze this user profile and output a tailored 50/30/20 budget plan in JSON.
Persona: ${userProfile.profile_type}
Monthly Income: ${userProfile.currency}${totalInflow}
Expenses: ${JSON.stringify(expenses.slice(0, 15))}
Goals: ${JSON.stringify(goals)}

Return ONLY valid JSON matching this schema:
{
  "allocations": {
    "needs": {"percentage": 50, "amount": 0},
    "wants": {"percentage": 30, "amount": 0},
    "savings": {"percentage": 20, "amount": 0}
  },
  "category_limits": {
    "Rent": 0, "Food": 0, "Transport": 0, "Entertainment": 0, 
    "Groceries": 0, "Utilities": 0, "Education": 0, "Healthcare": 0, 
    "Shopping": 0, "Other": 0
  },
  "strategy_note": "A concise actionable paragraph for this persona"
}`;
      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text?.trim() || "";
      const parsed = JSON.parse(text);
      return res.json({
        plan_data: {
          ...rulePlan,
          ...parsed,
          overspending_alerts: rulePlan.overspending_alerts,
        },
      });
    } catch (err) {
      console.warn("Gemini budget generation failed, returning rule budget:", err);
    }
  }

  res.json({ plan_data: rulePlan });
});

app.get("/api/suggestions", async (req, res) => {
  const currency = userProfile.currency;
  const foodSpent = expenses
    .filter((e) => e.category === "Food")
    .reduce((acc, e) => acc + e.amount, 0);
  const entSpent = expenses
    .filter((e) => e.category === "Entertainment")
    .reduce((acc, e) => acc + e.amount, 0);
  const shopSpent = expenses
    .filter((e) => e.category === "Shopping")
    .reduce((acc, e) => acc + e.amount, 0);

  const tips = [
    {
      title: "Optimize Dining & Delivery Spend",
      category: "Food",
      impact: "High",
      annual_savings: `${currency}${(foodSpent * 0.25 * 12).toLocaleString()}/year`,
      tip: `You spent ${currency}${foodSpent.toLocaleString()} on dining out. Cooking at home just 2 extra nights a week saves ~${currency}${Math.round(foodSpent * 0.25).toLocaleString()}/month.`,
    },
    {
      title: "Entertainment & Streaming Audit",
      category: "Entertainment",
      impact: "Medium",
      annual_savings: `${currency}${(entSpent * 0.3 * 12).toLocaleString()}/year`,
      tip: `Audit unused subscriptions and rotate streaming platforms to bank ${currency}${Math.round(entSpent * 0.3).toLocaleString()}/month with zero drop in weekend enjoyment.`,
    },
    {
      title: "48-Hour Impulsive Purchase Buffer",
      category: "Shopping",
      impact: "High",
      annual_savings: `${currency}${(shopSpent * 0.35 * 12).toLocaleString()}/year`,
      tip: `Enforce a 48-hour cooling period for non-essential online checkout items to automatically eliminate 35% of impulse clicks.`,
    },
  ];

  if (userProfile.profile_type === "Freelancer") {
    tips.push({
      title: "Automatic Tax & Runway Provisioning",
      category: "Savings",
      impact: "Critical",
      annual_savings: "Runway Cushion",
      tip: "Immediately channel 25% of all received client invoices into a separate high-yield liquid fund before spending a single rupee.",
    });
  } else if (userProfile.profile_type === "College Student") {
    tips.push({
      title: "Campus Academic Pass Discounts",
      category: "Education",
      impact: "High",
      annual_savings: `${currency}15,000/year`,
      tip: "Verify your student ID for transit cards, cloud developer packs, and academic book exchange groups.",
    });
  }

  res.json(tips);
});

app.get("/api/report", async (req, res) => {
  const currentMonth = "2026-09";
  const totalIncome =
    incomes.reduce((acc, i) => acc + i.amount, 0) || userProfile.monthly_income;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const categorySummary: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySummary[e.category] = (categorySummary[e.category] || 0) + e.amount;
  });

  let healthScore = 78;
  if (savingsRate >= 25) healthScore = 88;
  else if (savingsRate >= 15) healthScore = 76;
  else if (savingsRate > 0) healthScore = 64;
  else healthScore = 45;

  let insight = `Outstanding fiscal discipline this month! You achieved a robust ${savingsRate}% savings rate (${userProfile.currency}${netSavings.toLocaleString()} net surplus), well above the standard 20% benchmark. Your largest allocation went to ${Object.keys(categorySummary)[0] || "Housing"}, while emergency runway targets remain steadily funded.`;

  // Enhance insight via Gemini if available
  if (aiClient) {
    try {
      const prompt = `Write a concise 3-sentence executive summary insight for a monthly personal finance report.
Persona: ${userProfile.profile_type}
Income: ${userProfile.currency}${totalIncome}
Expenses: ${userProfile.currency}${totalExpenses}
Net Savings: ${userProfile.currency}${netSavings} (${savingsRate}%)
Categories: ${JSON.stringify(categorySummary)}
Goals: ${JSON.stringify(goals)}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });
      if (response.text) {
        insight = response.text.trim();
      }
    } catch (e) {
      console.warn("Gemini report insight failed, using rule insight:", e);
    }
  }

  res.json({
    month_year: currentMonth,
    currency: userProfile.currency,
    profile_type: userProfile.profile_type,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_savings: netSavings,
    savings_rate: savingsRate,
    health_score: healthScore,
    category_summary: categorySummary,
    goals,
    ai_insights: insight,
  });
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.json({ reply: "Please ask a question regarding your financial planning!" });
  }

  const totalIncome =
    incomes.reduce((acc, i) => acc + i.amount, 0) || userProfile.monthly_income;
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = totalIncome - totalSpent;
  const currency = userProfile.currency;
  const profile = userProfile.profile_type;

  // If Gemini API is available, generate contextual answer
  if (aiClient) {
    try {
      const prompt = `You are FinPilot, an elite AI Personal Finance Advisor.
Answer the user's question directly and conversationally using their LIVE financial context:
User Persona: ${profile}
Monthly Income: ${currency}${totalIncome.toLocaleString()}
Total Outflow: ${currency}${totalSpent.toLocaleString()}
Net Cash Buffer Remaining: ${currency}${remaining.toLocaleString()}
Active Goals: ${JSON.stringify(goals)}
Recent Expenses: ${JSON.stringify(expenses.slice(0, 8))}

User Question: "${message}"

Rules:
1. Provide a clear bottom-line verdict first (e.g. Yes/No/With Conditions).
2. Show the exact calculation using their remaining buffer of ${currency}${remaining.toLocaleString()}.
3. Give persona-specific guidance (${profile}).
4. Use clean markdown formatting with bullet points and bold highlights.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      if (response.text) {
        return res.json({ reply: response.text.trim() });
      }
    } catch (err) {
      console.warn("Gemini chat advisor failed, falling back to rule engine:", err);
    }
  }

  // Robust Rule-Based Contextual Advisor Fallback
  const qLower = message.toLowerCase();
  if (qLower.includes("afford") || qLower.includes("buy") || qLower.includes("phone")) {
    const numbers = message.match(/[\d,]+/g);
    const amount = numbers ? parseFloat(numbers[0].replace(/,/g, "")) : 40000;

    let verdict = ``;
    let reason = ``;

    if (amount <= remaining * 0.45) {
      verdict = `✅ **Yes, you can comfortably afford this ${currency}${amount.toLocaleString()} purchase.**`;
      reason = `Your current disposable buffer this cycle is ${currency}${remaining.toLocaleString()}. This purchase consumes ${(
        (amount / remaining) *
        100
      ).toFixed(1)}% of your unallocated cushion without impacting scheduled goal contributions.`;
    } else if (amount <= remaining) {
      verdict = `⚠️ **Possible, but caution is strongly advised.**`;
      reason = `The ${currency}${amount.toLocaleString()} purchase will consume the majority of your remaining ${currency}${remaining.toLocaleString()} surplus, leaving virtually no safety margin for unexpected bills.`;
    } else {
      verdict = `❌ **Not recommended this month.**`;
      reason = `Your remaining uncommitted cash is ${currency}${remaining.toLocaleString()}. Spending ${currency}${amount.toLocaleString()} will cause an immediate ${currency}${(
        amount - remaining
      ).toLocaleString()} deficit or force you to pull funds from your emergency goals.`;
    }

    const reply = `${verdict}\n\n**Financial Assessment:**\n- Monthly Inflow: ${currency}${totalIncome.toLocaleString()}\n- Spent To Date: ${currency}${totalSpent.toLocaleString()}\n- Current Buffer: ${currency}${remaining.toLocaleString()}\n\n${reason}\n\n**FinPilot Recommendation:** If essential, consider splitting it into 3 equal monthly allocations or using a 0% interest sinking fund.`;
    return res.json({ reply });
  }

  if (qLower.includes("overspend") || qLower.includes("cut")) {
    const topCat = Object.entries(
      expenses.reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        },
        {} as Record<string, number>
      )
    ).sort((a, b) => b[1] - a[1])[0];

    const reply = `🔍 **Spending Velocity Analysis:**\n\nYour highest expenditure category this cycle is **${
      topCat ? topCat[0] : "Food"
    }** at **${currency}${topCat ? topCat[1].toLocaleString() : "9,500"}**.\n\n**Top 3 Immediate Optimization Moves:**\n1. **Food & Dining**: Cap weekend delivery orders to unlock ~${currency}2,500/month.\n2. **Subscriptions**: Cancel inactive streaming passes.\n3. **Pay Yourself First**: Transfer 20% to savings on the day salary arrives.`;
    return res.json({ reply });
  }

  const defaultReply = `Hello! I am your **FinPilot AI Advisor**. I've synchronized with your **${profile}** profile.\n\n- **Monthly Inflow**: ${currency}${totalIncome.toLocaleString()}\n- **Remaining Buffer**: ${currency}${remaining.toLocaleString()}\n- **Active Goals**: ${
    goals.length
  } on track\n\nAsk me anything like *"Can I afford a vacation?"*, *"How much emergency buffer do I need?"*, or *"Where am I overspending?"*!`;
  return res.json({ reply: defaultReply });
});

app.post("/api/demo-data", (req, res) => {
  const { profile_type } = req.body;
  const pType = profile_type || "Salaried Professional";
  userProfile.profile_type = pType;

  if (pType === "Freelancer") {
    userProfile.monthly_income = 110000;
    incomes = [
      {
        id: 1,
        source: "Fintech UI Redesign",
        client_name: "Acme Corp",
        amount: 50000,
        income_type: "variable",
        frequency: "project-based",
        date_received: "2026-09-02",
      },
      {
        id: 2,
        source: "Mobile App Consultation",
        client_name: "NeoBank Labs",
        amount: 35000,
        income_type: "variable",
        frequency: "project-based",
        date_received: "2026-09-10",
      },
      {
        id: 3,
        source: "Monthly Maintenance Retainer",
        client_name: "Starlight Media",
        amount: 25000,
        income_type: "fixed",
        frequency: "monthly",
        date_received: "2026-09-18",
      },
    ];
    expenses = [
      {
        id: 1,
        amount: 22000,
        category: "Rent",
        date_incurred: "2026-09-03",
        note: "Coworking Studio & Flat",
        payment_method: "Bank Transfer",
      },
      {
        id: 2,
        amount: 9400,
        category: "Groceries",
        date_incurred: "2026-09-06",
        note: "Organic groceries & pantry",
        payment_method: "UPI",
      },
      {
        id: 3,
        amount: 6500,
        category: "Food",
        date_incurred: "2026-09-09",
        note: "Client dinners & cafe work sessions",
        payment_method: "Card",
      },
      {
        id: 4,
        amount: 4200,
        category: "Transport",
        date_incurred: "2026-09-14",
        note: "Uber & car fuel",
        payment_method: "UPI",
      },
      {
        id: 5,
        amount: 3800,
        category: "Utilities",
        date_incurred: "2026-09-17",
        note: "Fiber Internet & AWS servers",
        payment_method: "Card",
      },
      {
        id: 6,
        amount: 7500,
        category: "Healthcare",
        date_incurred: "2026-09-20",
        note: "Comprehensive health insurance",
        payment_method: "Net Banking",
      },
      {
        id: 7,
        amount: 5200,
        category: "Entertainment",
        date_incurred: "2026-09-23",
        note: "Weekend streaming & games",
        payment_method: "Card",
      },
      {
        id: 8,
        amount: 6000,
        category: "Shopping",
        date_incurred: "2026-09-25",
        note: "Ergonomic standing desk accessories",
        payment_method: "Card",
      },
    ];
    goals = [
      {
        id: 1,
        title: "6-Month Lean Emergency Runway",
        target_amount: 300000,
        current_amount: 180000,
        deadline: "2027-03-31",
        category: "Emergency",
        icon: "Shield",
      },
      {
        id: 2,
        title: "M3 Max MacBook Pro Upgrade",
        target_amount: 180000,
        current_amount: 92000,
        deadline: "2027-01-31",
        category: "Purchase",
        icon: "Laptop",
      },
      {
        id: 3,
        title: "Quarterly Advance Tax Fund",
        target_amount: 75000,
        current_amount: 55000,
        deadline: "2026-12-15",
        category: "Savings",
        icon: "Briefcase",
      },
    ];
  } else if (pType === "College Student") {
    userProfile.monthly_income = 25000;
    incomes = [
      {
        id: 1,
        source: "Monthly Parental Allowance",
        client_name: "Family",
        amount: 18000,
        income_type: "fixed",
        frequency: "monthly",
        date_received: "2026-09-01",
      },
      {
        id: 2,
        source: "Campus Tutoring Stipend",
        client_name: "CS Dept",
        amount: 7000,
        income_type: "variable",
        frequency: "monthly",
        date_received: "2026-09-15",
      },
    ];
    expenses = [
      {
        id: 1,
        amount: 6500,
        category: "Food",
        date_incurred: "2026-09-04",
        note: "Hostel cafeteria & street food",
        payment_method: "UPI",
      },
      {
        id: 2,
        amount: 4500,
        category: "Education",
        date_incurred: "2026-09-08",
        note: "Semester textbooks & notebooks",
        payment_method: "UPI",
      },
      {
        id: 3,
        amount: 2200,
        category: "Transport",
        date_incurred: "2026-09-12",
        note: "Metro student pass",
        payment_method: "Card",
      },
      {
        id: 4,
        amount: 2800,
        category: "Entertainment",
        date_incurred: "2026-09-16",
        note: "Movie outing with hostel friends",
        payment_method: "UPI",
      },
      {
        id: 5,
        amount: 1800,
        category: "Shopping",
        date_incurred: "2026-09-20",
        note: "Backpack & college stationery",
        payment_method: "Card",
      },
      {
        id: 6,
        amount: 1200,
        category: "Utilities",
        date_incurred: "2026-09-22",
        note: "5G Unlimited data pack",
        payment_method: "UPI",
      },
    ];
    goals = [
      {
        id: 1,
        title: "Goa Batch Trip",
        target_amount: 20000,
        current_amount: 14000,
        deadline: "2026-12-20",
        category: "Travel",
        icon: "Plane",
      },
      {
        id: 2,
        title: "ANC Coding Headphones",
        target_amount: 12000,
        current_amount: 6000,
        deadline: "2027-02-15",
        category: "Purchase",
        icon: "Headphones",
      },
      {
        id: 3,
        title: "Allowance Safety Buffer",
        target_amount: 10000,
        current_amount: 7500,
        deadline: "2026-11-30",
        category: "Savings",
        icon: "Shield",
      },
    ];
  } else if (pType === "Household Manager") {
    userProfile.monthly_income = 95000;
    incomes = [
      {
        id: 1,
        source: "Primary Household Contribution",
        client_name: "Joint Account",
        amount: 70000,
        income_type: "fixed",
        frequency: "monthly",
        date_received: "2026-09-01",
      },
      {
        id: 2,
        source: "Rental Property Income",
        client_name: "Apartment 3B",
        amount: 25000,
        income_type: "fixed",
        frequency: "monthly",
        date_received: "2026-09-05",
      },
    ];
    expenses = [
      {
        id: 1,
        amount: 24000,
        category: "Groceries",
        date_incurred: "2026-09-02",
        note: "Wholesale monthly family pantry",
        payment_method: "UPI",
      },
      {
        id: 2,
        amount: 22000,
        category: "Rent",
        date_incurred: "2026-09-05",
        note: "Society maintenance & base rent",
        payment_method: "Bank Transfer",
      },
      {
        id: 3,
        amount: 9800,
        category: "Utilities",
        date_incurred: "2026-09-10",
        note: "Electricity, piped gas, water",
        payment_method: "UPI",
      },
      {
        id: 4,
        amount: 11000,
        category: "Education",
        date_incurred: "2026-09-15",
        note: "Kids school tuition fees & books",
        payment_method: "Net Banking",
      },
      {
        id: 5,
        amount: 5500,
        category: "Healthcare",
        date_incurred: "2026-09-18",
        note: "Family vitamins & prescription",
        payment_method: "UPI",
      },
      {
        id: 6,
        amount: 4800,
        category: "Transport",
        date_incurred: "2026-09-22",
        note: "School van & car petrol",
        payment_method: "Card",
      },
    ];
    goals = [
      {
        id: 1,
        title: "Family Medical Sinking Fund",
        target_amount: 250000,
        current_amount: 175000,
        deadline: "2027-04-30",
        category: "Emergency",
        icon: "Shield",
      },
      {
        id: 2,
        title: "Annual Family Vacation",
        target_amount: 120000,
        current_amount: 65000,
        deadline: "2027-06-15",
        category: "Travel",
        icon: "Umbrella",
      },
      {
        id: 3,
        title: "Home Solar Inverter Upgrade",
        target_amount: 80000,
        current_amount: 40000,
        deadline: "2027-01-31",
        category: "Purchase",
        icon: "Home",
      },
    ];
  } else {
    // Salaried
    userProfile.monthly_income = 85000;
    incomes = [
      {
        id: 1,
        source: "Senior Engineer Salary",
        client_name: "Fintech Corp",
        amount: 85000,
        income_type: "fixed",
        frequency: "monthly",
        date_received: "2026-09-01",
      },
    ];
    expenses = [
      {
        id: 1,
        amount: 25000,
        category: "Rent",
        date_incurred: "2026-09-02",
        note: "Apartment Rent & Maintenance",
        payment_method: "Net Banking",
      },
      {
        id: 2,
        amount: 9500,
        category: "Food",
        date_incurred: "2026-09-05",
        note: "Gourmet dining & work lunches",
        payment_method: "UPI",
      },
      {
        id: 3,
        amount: 8200,
        category: "Groceries",
        date_incurred: "2026-09-08",
        note: "Monthly pantry staples & Blinkit",
        payment_method: "UPI",
      },
      {
        id: 4,
        amount: 4800,
        category: "Transport",
        date_incurred: "2026-09-10",
        note: "Fuel & Metro recharge",
        payment_method: "Card",
      },
      {
        id: 5,
        amount: 3500,
        category: "Utilities",
        date_incurred: "2026-09-14",
        note: "Broadband, Power & Water",
        payment_method: "UPI",
      },
      {
        id: 6,
        amount: 6200,
        category: "Entertainment",
        date_incurred: "2026-09-18",
        note: "Concert tickets & OTT",
        payment_method: "Card",
      },
      {
        id: 7,
        amount: 4500,
        category: "Shopping",
        date_incurred: "2026-09-22",
        note: "Wardrobe & tech gear",
        payment_method: "Card",
      },
      {
        id: 8,
        amount: 2500,
        category: "Healthcare",
        date_incurred: "2026-09-24",
        note: "Gym membership & supplements",
        payment_method: "UPI",
      },
    ];
    goals = [
      {
        id: 1,
        title: "6-Month Emergency Runway",
        target_amount: 250000,
        current_amount: 165000,
        deadline: "2027-02-28",
        category: "Emergency",
        icon: "Shield",
      },
      {
        id: 2,
        title: "Japan Autumn Trip",
        target_amount: 180000,
        current_amount: 85000,
        deadline: "2027-10-15",
        category: "Travel",
        icon: "Plane",
      },
      {
        id: 3,
        title: "Down Payment Wealth Pool",
        target_amount: 500000,
        current_amount: 195000,
        deadline: "2028-04-01",
        category: "Savings",
        icon: "Home",
      },
    ];
  }

  res.json({ success: true, message: `Loaded demo data for ${pType}` });
});

// Vite Middleware Integration for Dev / Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FinPilot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
