"""
FinPilot - AI Engine powered by Google Gemini API
Includes prompt templates, JSON response enforcers, and graceful rule-based fallbacks.
"""

import os
import json
import re
from typing import Dict, Any, List

# Check if google.generativeai is installed and key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

try:
    import google.generativeai as genai
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        _HAS_GEMINI = True
    else:
        _HAS_GEMINI = False
except Exception:
    _HAS_GEMINI = False


def _clean_json_text(text: str) -> str:
    """Strip markdown code fence blocks if returned by LLM."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


def get_rule_based_budget(profile_type: str, monthly_income: float, currency: str, current_expenses: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Robust fallback 50/30/20 budget generator customized per profile type.
    """
    income = float(monthly_income) if monthly_income > 0 else 50000.0
    
    # Profile-tuned allocation percentages
    if profile_type == "College Student":
        needs_pct, wants_pct, save_pct = 0.55, 0.30, 0.15
        cat_alloc = {
            "Food": 0.30, "Education": 0.20, "Transport": 0.12, 
            "Entertainment": 0.10, "Shopping": 0.08, "Utilities": 0.05, "Other": 0.15
        }
        note = "Student Focus: Priority on low-cost food meal preps, textbook sharing, and keeping a ₹3,000 allowance safety buffer."
    elif profile_type == "Freelancer":
        needs_pct, wants_pct, save_pct = 0.45, 0.25, 0.30
        cat_alloc = {
            "Rent": 0.25, "Groceries": 0.15, "Utilities": 0.10,
            "Healthcare": 0.08, "Food": 0.12, "Transport": 0.08, "Shopping": 0.07, "Other": 0.15
        }
        note = "Freelancer Buffer: Aggressive 30% savings allocated for 6-month lean emergency reserve and tax provisions."
    elif profile_type == "Household Manager":
        needs_pct, wants_pct, save_pct = 0.60, 0.20, 0.20
        cat_alloc = {
            "Groceries": 0.25, "Rent": 0.25, "Utilities": 0.15,
            "Healthcare": 0.10, "Education": 0.10, "Transport": 0.08, "Other": 0.07
        }
        note = "Family Household: Strict bulk grocery savings and family healthcare sinking fund with clear utility caps."
    else: # Salaried Professional
        needs_pct, wants_pct, save_pct = 0.50, 0.30, 0.20
        cat_alloc = {
            "Rent": 0.28, "Food": 0.15, "Groceries": 0.12, 
            "Transport": 0.08, "Utilities": 0.07, "Entertainment": 0.10, 
            "Shopping": 0.08, "Healthcare": 0.05, "Other": 0.07
        }
        note = "Salaried 50/30/20 Wealth Builder: Fixed emergency automated SIP transfer on payday and dining-out cap."

    category_limits = {}
    for cat, weight in cat_alloc.items():
        category_limits[cat] = round(income * weight, 0)

    # Check for overspending if current expenses provided
    overspending_alerts = []
    if current_expenses:
        cat_spent = {}
        for exp in current_expenses:
            c = exp.get("category", "Other")
            cat_spent[c] = cat_spent.get(c, 0.0) + float(exp.get("amount", 0.0))
        
        for c, spent in cat_spent.items():
            limit = category_limits.get(c, income * 0.1)
            if spent > limit:
                overspend_diff = spent - limit
                overspending_alerts.append({
                    "category": c,
                    "spent": spent,
                    "limit": limit,
                    "overspend": overspend_diff,
                    "message": f"Over budget in {c} by {currency}{overspend_diff:,.0f} ({int((spent/limit)*100)}% of limit)."
                })

    return {
        "monthly_income": income,
        "profile_type": profile_type,
        "currency": currency,
        "allocations": {
            "needs": {"percentage": int(needs_pct * 100), "amount": round(income * needs_pct, 0)},
            "wants": {"percentage": int(wants_pct * 100), "amount": round(income * wants_pct, 0)},
            "savings": {"percentage": int(save_pct * 100), "amount": round(income * save_pct, 0)}
        },
        "category_limits": category_limits,
        "strategy_note": note,
        "overspending_alerts": overspending_alerts
    }


def generate_budget_plan(profile_type: str, monthly_income: float, currency: str, expenses: List[Dict[str, Any]], goals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate an intelligent budget plan using Gemini, with full fallback.
    """
    if not _HAS_GEMINI or not os.getenv("GEMINI_API_KEY"):
        return get_rule_based_budget(profile_type, monthly_income, currency, expenses)

    prompt = f"""
You are FinPilot, an expert AI Personal Finance Advisor.
Analyze the following financial profile and return a structured JSON budget plan.

User Profile:
- Persona: {profile_type}
- Monthly Income: {currency}{monthly_income:,.2f}
- Currency: {currency}
- Goals: {json.dumps(goals)}
- Recent Expenses: {json.dumps(expenses[-20:] if expenses else [])}

Rules:
1. Apply an adaptive 50/30/20 framework customized for {profile_type}. (E.g. Freelancers need more savings/cushion; Students need higher educational/living flexibility).
2. Calculate category limits for: Rent, Food, Transport, Entertainment, Groceries, Utilities, Education, Healthcare, Shopping, Other.
3. Compare actual spent against category limits to detect any overspending.
4. Provide a tailored strategy note specific to {profile_type}.

You MUST output ONLY valid JSON with this exact schema:
{{
  "allocations": {{
    "needs": {{"percentage": 50, "amount": 0}},
    "wants": {{"percentage": 30, "amount": 0}},
    "savings": {{"percentage": 20, "amount": 0}}
  }},
  "category_limits": {{
    "Rent": 0, "Food": 0, "Transport": 0, "Entertainment": 0, 
    "Groceries": 0, "Utilities": 0, "Education": 0, "Healthcare": 0, 
    "Shopping": 0, "Other": 0
  }},
  "strategy_note": "A paragraph explaining actionable advice for this persona",
  "overspending_alerts": [
    {{"category": "Food", "spent": 0, "limit": 0, "overspend": 0, "message": "Alert text"}}
  ]
}}
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash") # or gemini-2.0-flash / fallback
        response = model.generate_content(prompt)
        cleaned = _clean_json_text(response.text)
        data = json.loads(cleaned)
        data["monthly_income"] = monthly_income
        data["profile_type"] = profile_type
        data["currency"] = currency
        return data
    except Exception as e:
        print(f"Gemini API budget generation failed ({e}), using fallback.")
        return get_rule_based_budget(profile_type, monthly_income, currency, expenses)


def generate_saving_suggestions(profile_type: str, monthly_income: float, currency: str, expenses: List[Dict[str, Any]], goals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate high-impact, personalized saving tips with concrete math (e.g. saves ₹24,000/yr).
    """
    total_spent = sum(float(e.get("amount", 0)) for e in expenses)
    food_spent = sum(float(e.get("amount", 0)) for e in expenses if e.get("category") == "Food")
    entertainment_spent = sum(float(e.get("amount", 0)) for e in expenses if e.get("category") == "Entertainment")
    shopping_spent = sum(float(e.get("amount", 0)) for e in expenses if e.get("category") == "Shopping")

    if not _HAS_GEMINI or not os.getenv("GEMINI_API_KEY"):
        # Concrete mathematical rule-based suggestions
        tips = []
        if food_spent > 0.15 * monthly_income and food_spent > 0:
            diff = round(food_spent * 0.25, 0)
            annual = diff * 12
            tips.append({
                "title": "Optimize Dining & Delivery Spend",
                "category": "Food",
                "impact": "High",
                "annual_savings": f"{currency}{annual:,.0f}/year",
                "tip": f"You spent {currency}{food_spent:,.0f} on dining out and delivery. Shifting just 2 meal orders per week to home cooking can save ~{currency}{diff:,.0f}/month, adding {currency}{annual:,.0f} directly to your emergency buffer."
            })
        if entertainment_spent > 0.08 * monthly_income and entertainment_spent > 0:
            diff = round(entertainment_spent * 0.30, 0)
            annual = diff * 12
            tips.append({
                "title": "Subscription & Weekend Audit",
                "category": "Entertainment",
                "impact": "Medium",
                "annual_savings": f"{currency}{annual:,.0f}/year",
                "tip": f"Audit recurring digital subscriptions and weekend outings to save {currency}{diff:,.0f}/month ({currency}{annual:,.0f}/yr) with zero drop in lifestyle quality."
            })
        if shopping_spent > 0.10 * monthly_income and shopping_spent > 0:
            diff = round(shopping_spent * 0.35, 0)
            annual = diff * 12
            tips.append({
                "title": "Enforce 48-Hour Impulsive Buy Rule",
                "category": "Shopping",
                "impact": "High",
                "annual_savings": f"{currency}{annual:,.0f}/year",
                "tip": f"Add wishlist items to a 48-hour cool-off cart. Studies show this curtails 35% of impulse checkout clicks, keeping {currency}{annual:,.0f} in your pocket annually."
            })
        
        # Profile specific default tip
        if profile_type == "Freelancer":
            tips.append({
                "title": "Separate Tax & Lean Reserve Bucket",
                "category": "Savings",
                "impact": "Critical",
                "annual_savings": "Buffer Security",
                "tip": "Freelancer cashflow fluctuates: route 25% of every invoice straight into a high-yield liquid fund on the same day payment hits."
            })
        elif profile_type == "College Student":
            tips.append({
                "title": "Leverage Student Discounts & Campus Meal Passes",
                "category": "Education",
                "impact": "High",
                "annual_savings": f"{currency}18,000/year",
                "tip": "Always register with your academic .edu / college ID for transit passes, tech hardware deals, and software tools."
            })
        else:
            tips.append({
                "title": "Automate Payday SIP Transfers",
                "category": "Savings",
                "impact": "High",
                "annual_savings": f"{currency}30,000+/year",
                "tip": "Pay yourself first: set automated standing instructions within 24 hours of salary credit so saving never relies on end-of-month leftover scraps."
            })
        return tips

    prompt = f"""
Analyze this user's finances and output 3-4 personalized, high-impact savings suggestions.
Persona: {profile_type}
Monthly Income: {currency}{monthly_income}
Currency: {currency}
Expenses: {json.dumps(expenses[-20:] if expenses else [])}

Return ONLY valid JSON matching this schema:
[
  {{
    "title": "Short punchy title",
    "category": "Category name",
    "impact": "High" | "Medium",
    "annual_savings": "{currency}X/year",
    "tip": "Specific actionable insight with exact rupee/currency calculations."
  }}
]
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(prompt)
        data = json.loads(_clean_json_text(resp.text))
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Gemini API saving tips failed ({e}), using fallback.")
        return generate_saving_suggestions(profile_type, monthly_income, currency, expenses, goals)


def generate_monthly_insight(profile_type: str, currency: str, total_income: float, total_expenses: float, category_summary: Dict[str, float], goals: List[Dict[str, Any]]) -> str:
    """
    Produce an executive financial health insight paragraph for the monthly summary report.
    """
    savings = total_income - total_expenses
    rate = round((savings / total_income) * 100, 1) if total_income > 0 else 0

    if not _HAS_GEMINI or not os.getenv("GEMINI_API_KEY"):
        top_cat = max(category_summary.items(), key=lambda x: x[1])[0] if category_summary else "Living Expenses"
        if rate >= 25:
            tone = f"Outstanding performance this month! You achieved a healthy {rate}% savings rate ({currency}{savings:,.0f} surplus), well ahead of the standard 20% benchmark."
        elif rate > 0:
            tone = f"Stable financial footing with a {rate}% savings rate ({currency}{savings:,.0f} net saved). Largest expenditure was concentrated in {top_cat}."
        else:
            tone = f"Caution: Outflows exceeded income by {currency}{abs(savings):,.0f}. Immediate adjustment in discretionary spending ({top_cat}) is advised to safeguard emergency reserves."
        
        return f"{tone} As a {profile_type}, maintaining strict discipline around {top_cat} while accelerating progress toward your target financial milestones remains your highest-leverage strategy."

    prompt = f"""
Write a concise, professional 3-sentence executive summary insight for a monthly personal finance report.
Persona: {profile_type}
Income: {currency}{total_income}
Expenses: {currency}{total_expenses}
Net Savings: {currency}{savings} (Savings Rate: {rate}%)
Category Breakdown: {json.dumps(category_summary)}
Goals: {json.dumps(goals)}

Deliver natural, empathetic yet analytically sharp guidance. Do not use generic filler words.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return generate_monthly_insight(profile_type, currency, total_income, total_expenses, category_summary, goals)


def answer_chat_advisor(user_question: str, context: Dict[str, Any]) -> str:
    """
    Provide scenario-aware contextual financial advice (e.g. "Can I afford a ₹40,000 phone?").
    """
    user_info = context.get("user", {})
    currency = user_info.get("currency", "₹")
    income = float(user_info.get("monthly_income", 60000))
    expenses = context.get("expenses", [])
    goals = context.get("goals", [])
    budget = context.get("budget", {})
    profile = user_info.get("profile_type", "Salaried Professional")

    total_spent = sum(float(e.get("amount", 0)) for e in expenses)
    remaining_month = income - total_spent

    if not _HAS_GEMINI or not os.getenv("GEMINI_API_KEY"):
        # Context-aware deterministic rule response
        q_lower = user_question.lower()
        if "afford" in q_lower or "phone" in q_lower or "buy" in q_lower:
            # Extract number if any
            numbers = re.findall(r"[\d,]+", user_question)
            amount = float(numbers[0].replace(",", "")) if numbers else 40000.0
            
            if amount <= remaining_month * 0.4:
                verdict = f"✅ **Yes, you can comfortably afford this {currency}{amount:,.0f} purchase.**"
                reason = f"Your current cash surplus this month is {currency}{remaining_month:,.0f}. This purchase will consume {(amount/remaining_month)*100:.1f}% of your unallocated buffer without endangering your monthly necessities."
            elif amount <= remaining_month:
                verdict = f"⚠️ **Possible, but proceed with caution.**"
                reason = f"The {currency}{amount:,.0f} cost will consume nearly all of your remaining {currency}{remaining_month:,.0f} cash cushion for the month, leaving you vulnerable to unanticipated emergency bills."
            else:
                verdict = f"❌ **Not recommended this month.**"
                reason = f"Your remaining disposable income is {currency}{remaining_month:,.0f}. Purchasing a {currency}{amount:,.0f} item right now would result in a {currency}{amount - remaining_month:,.0f} deficit or require liquidating savings goals."
            
            return f"{verdict}\n\n**Financial Assessment:**\n- Monthly Income: {currency}{income:,.0f}\n- Spent So Far: {currency}{total_spent:,.0f}\n- Remaining Buffer: {currency}{remaining_month:,.0f}\n\n{reason}\n\n**Advisor Recommendation:** If this is a necessity, consider a 3-month planned sinking fund or split it into 0% interest installments rather than a single lump-sum drain."

        if "save" in q_lower or "budget" in q_lower:
            return f"Based on your profile as a **{profile}**, here is your priority blueprint:\n1. **Fixed Ceiling**: Cap needs at 50% ({currency}{income*0.5:,.0f}).\n2. **Emergency Stash**: Keep at least 3-6 months ({currency}{income*3:,.0f}–{currency}{income*6:,.0f}) in a separate liquid account.\n3. **Active Goals**: Currently funding {len(goals)} active targets. Automate transfers on payday before discretionary spending occurs."

        return f"Hello! As your FinPilot advisor, I've analyzed your {profile} finances. You have earned {currency}{income:,.0f} this cycle with {currency}{remaining_month:,.0f} remaining to spend safely. Ask me any question like 'Can I afford a trip?', 'Where am I overspending?', or 'How should I allocate my savings?'!"

    prompt = f"""
You are FinPilot, an elite personal finance advisor.
Answer the user's question directly, accurately, and empathetically, using their real financial context:

User Profile:
- Persona: {profile}
- Monthly Income: {currency}{income:,.2f}
- Current Total Expenses: {currency}{total_spent:,.2f}
- Net Cash Remaining This Month: {currency}{remaining_month:,.2f}
- Active Goals: {json.dumps(goals)}
- Budget Limits: {json.dumps(budget.get("category_limits", {}))}

User Question: "{user_question}"

Guidelines:
1. Provide a clear bottom-line verdict first (e.g. Yes/No/With Conditions).
2. Show the exact math using their income, remaining buffer, and active goals.
3. Keep advice tailored to their persona ({profile}). E.g. Freelancers must preserve 6-month cushions; Students need low-cost substitutions; Households need family stability.
4. Format using clean markdown bullet points and bold highlights.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception as e:
        print(f"Gemini API chat failed ({e}), using fallback.")
        return answer_chat_advisor(user_question, context)
