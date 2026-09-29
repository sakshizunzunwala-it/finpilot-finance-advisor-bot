"""
FinPilot - Personal Finance Advisor Bot
Flask Application with SQLAlchemy ORM, SQLite DB, RESTful APIs, and Gemini AI Engine
"""

import os
from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from models import db, User, Income, Expense, Goal, BudgetPlan, MonthlyReport
import ai_engine

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# SQLite Database setup
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'finpilot.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


def get_default_user():
    """Fetch the active user or create the initial user."""
    user = User.query.first()
    if not user:
        user = User(
            name="Alex Morgan",
            profile_type="Salaried Professional",
            monthly_income=75000.0,
            currency="₹"
        )
        db.session.add(user)
        db.session.commit()
    return user


def calculate_health_score(user, total_income, total_spent, savings_rate, goals, budget_plan):
    """
    Compute a comprehensive Financial Health Score (0 - 100).
    Factors:
    - Savings rate (up to 35 pts): 20%+ gets max points
    - Budget adherence / overspending (up to 30 pts)
    - Goal progress / emergency cushion (up to 25 pts)
    - Debt / Expense control ratio (up to 10 pts)
    """
    score = 0
    
    # 1. Savings rate
    if savings_rate >= 25:
        score += 35
    elif savings_rate >= 15:
        score += 25
    elif savings_rate > 0:
        score += 15
    else:
        score += 5

    # 2. Budget adherence
    if total_income > 0:
        spend_ratio = total_spent / total_income
        if spend_ratio <= 0.70:
            score += 30
        elif spend_ratio <= 0.85:
            score += 22
        elif spend_ratio <= 1.0:
            score += 12
        else:
            score += 4
    else:
        score += 10

    # 3. Goals active
    if goals:
        completed_or_on_track = sum(1 for g in goals if (g.current_amount / g.target_amount) >= 0.3) if goals else 0
        score += min(25, 10 + completed_or_on_track * 5)
    else:
        score += 10

    # 4. Profile stability bonus
    if user.profile_type == "Freelancer":
        # Check emergency fund goal
        has_emergency = any("emergency" in g.title.lower() for g in goals)
        score += 10 if has_emergency else 4
    else:
        score += 10

    return min(100, max(20, score))


# ----------------- ROUTES ----------------- #

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/profile', methods=['GET', 'POST', 'PUT'])
def handle_profile():
    user = get_default_user()
    if request.method in ['POST', 'PUT']:
        data = request.json or {}
        if 'name' in data:
            user.name = data['name']
        if 'profile_type' in data:
            user.profile_type = data['profile_type']
        if 'monthly_income' in data:
            user.monthly_income = float(data['monthly_income'])
        if 'currency' in data:
            user.currency = data['currency']
        db.session.commit()
    
    return jsonify(user.to_dict())


@app.route('/api/income', methods=['GET', 'POST', 'DELETE'])
def handle_income():
    user = get_default_user()
    if request.method == 'POST':
        data = request.json or {}
        rec_date = date.today()
        if data.get('date_received'):
            try:
                rec_date = datetime.strptime(data['date_received'], "%Y-%m-%d").date()
            except ValueError:
                pass

        income = Income(
            user_id=user.id,
            source=data.get('source', 'Salary / Primary'),
            client_name=data.get('client_name'),
            amount=float(data.get('amount', 0.0)),
            income_type=data.get('income_type', 'fixed'),
            frequency=data.get('frequency', 'monthly'),
            date_received=rec_date,
            notes=data.get('notes', '')
        )
        db.session.add(income)
        db.session.commit()
        return jsonify(income.to_dict()), 201

    elif request.method == 'DELETE':
        income_id = request.args.get('id')
        if income_id:
            inc = Income.query.filter_by(id=income_id, user_id=user.id).first()
            if inc:
                db.session.delete(inc)
                db.session.commit()
                return jsonify({"success": True})
        return jsonify({"error": "Income not found"}), 404

    incomes = Income.query.filter_by(user_id=user.id).order_by(Income.date_received.desc()).all()
    return jsonify([i.to_dict() for i in incomes])


@app.route('/api/expenses', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_expenses():
    user = get_default_user()
    
    if request.method == 'POST':
        data = request.json or {}
        exp_date = date.today()
        if data.get('date_incurred'):
            try:
                exp_date = datetime.strptime(data['date_incurred'], "%Y-%m-%d").date()
            except ValueError:
                pass

        expense = Expense(
            user_id=user.id,
            amount=float(data.get('amount', 0.0)),
            category=data.get('category', 'Other'),
            date_incurred=exp_date,
            note=data.get('note', ''),
            payment_method=data.get('payment_method', 'UPI/Card')
        )
        db.session.add(expense)
        db.session.commit()
        return jsonify(expense.to_dict()), 201

    elif request.method == 'PUT':
        exp_id = request.args.get('id')
        expense = Expense.query.filter_by(id=exp_id, user_id=user.id).first()
        if not expense:
            return jsonify({"error": "Expense not found"}), 404
        data = request.json or {}
        if 'amount' in data:
            expense.amount = float(data['amount'])
        if 'category' in data:
            expense.category = data['category']
        if 'note' in data:
            expense.note = data['note']
        if 'date_incurred' in data:
            try:
                expense.date_incurred = datetime.strptime(data['date_incurred'], "%Y-%m-%d").date()
            except ValueError:
                pass
        db.session.commit()
        return jsonify(expense.to_dict())

    elif request.method == 'DELETE':
        exp_id = request.args.get('id')
        expense = Expense.query.filter_by(id=exp_id, user_id=user.id).first()
        if expense:
            db.session.delete(expense)
            db.session.commit()
            return jsonify({"success": True})
        return jsonify({"error": "Expense not found"}), 404

    expenses = Expense.query.filter_by(user_id=user.id).order_by(Expense.date_incurred.desc()).all()
    return jsonify([e.to_dict() for e in expenses])


@app.route('/api/goals', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_goals():
    user = get_default_user()

    if request.method == 'POST':
        data = request.json or {}
        dl_date = date.today() + timedelta(days=180)
        if data.get('deadline'):
            try:
                dl_date = datetime.strptime(data['deadline'], "%Y-%m-%d").date()
            except ValueError:
                pass

        goal = Goal(
            user_id=user.id,
            title=data.get('title', 'Emergency Fund'),
            target_amount=float(data.get('target_amount', 100000)),
            current_amount=float(data.get('current_amount', 0)),
            deadline=dl_date,
            category=data.get('category', 'Savings'),
            icon=data.get('icon', 'Target')
        )
        db.session.add(goal)
        db.session.commit()
        return jsonify(goal.to_dict()), 201

    elif request.method == 'PUT':
        goal_id = request.args.get('id')
        goal = Goal.query.filter_by(id=goal_id, user_id=user.id).first()
        if not goal:
            return jsonify({"error": "Goal not found"}), 404
        data = request.json or {}
        if 'current_amount' in data:
            goal.current_amount = float(data['current_amount'])
        if 'target_amount' in data:
            goal.target_amount = float(data['target_amount'])
        if 'title' in data:
            goal.title = data['title']
        db.session.commit()
        return jsonify(goal.to_dict())

    elif request.method == 'DELETE':
        goal_id = request.args.get('id')
        goal = Goal.query.filter_by(id=goal_id, user_id=user.id).first()
        if goal:
            db.session.delete(goal)
            db.session.commit()
            return jsonify({"success": True})
        return jsonify({"error": "Goal not found"}), 404

    goals = Goal.query.filter_by(user_id=user.id).all()
    return jsonify([g.to_dict() for g in goals])


@app.route('/api/budget', methods=['GET', 'POST'])
def handle_budget():
    user = get_default_user()
    current_month = datetime.now().strftime("%Y-%m")

    if request.method == 'POST' or request.args.get('refresh') == 'true':
        expenses = [e.to_dict() for e in Expense.query.filter_by(user_id=user.id).all()]
        goals = [g.to_dict() for g in Goal.query.filter_by(user_id=user.id).all()]
        
        plan_dict = ai_engine.generate_budget_plan(
            profile_type=user.profile_type,
            monthly_income=user.monthly_income,
            currency=user.currency,
            expenses=expenses,
            goals=goals
        )

        existing_plan = BudgetPlan.query.filter_by(user_id=user.id, month_year=current_month).first()
        if not existing_plan:
            existing_plan = BudgetPlan(user_id=user.id, month_year=current_month, plan_data=plan_dict, strategy_note=plan_dict.get("strategy_note", ""))
            db.session.add(existing_plan)
        else:
            existing_plan.plan_data = plan_dict
            existing_plan.strategy_note = plan_dict.get("strategy_note", "")
        db.session.commit()
        return jsonify(existing_plan.to_dict())

    plan = BudgetPlan.query.filter_by(user_id=user.id, month_year=current_month).first()
    if not plan:
        # Generate initial plan
        expenses = [e.to_dict() for e in Expense.query.filter_by(user_id=user.id).all()]
        goals = [g.to_dict() for g in Goal.query.filter_by(user_id=user.id).all()]
        plan_dict = ai_engine.generate_budget_plan(user.profile_type, user.monthly_income, user.currency, expenses, goals)
        plan = BudgetPlan(user_id=user.id, month_year=current_month, plan_data=plan_dict, strategy_note=plan_dict.get("strategy_note", ""))
        db.session.add(plan)
        db.session.commit()

    return jsonify(plan.to_dict())


@app.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    user = get_default_user()
    expenses = [e.to_dict() for e in Expense.query.filter_by(user_id=user.id).all()]
    goals = [g.to_dict() for g in Goal.query.filter_by(user_id=user.id).all()]
    
    tips = ai_engine.generate_saving_suggestions(
        profile_type=user.profile_type,
        monthly_income=user.monthly_income,
        currency=user.currency,
        expenses=expenses,
        goals=goals
    )
    return jsonify(tips)


@app.route('/api/report', methods=['GET'])
def get_report():
    user = get_default_user()
    current_month = datetime.now().strftime("%Y-%m")

    incomes = Income.query.filter_by(user_id=user.id).all()
    expenses = Expense.query.filter_by(user_id=user.id).all()
    goals = Goal.query.filter_by(user_id=user.id).all()

    total_income = sum(i.amount for i in incomes) or user.monthly_income
    total_expenses = sum(e.amount for e in expenses)
    net_savings = total_income - total_expenses
    savings_rate = round((net_savings / total_income) * 100, 1) if total_income > 0 else 0

    category_summary = {}
    for exp in expenses:
        category_summary[exp.category] = category_summary.get(exp.category, 0) + exp.amount

    budget_plan = BudgetPlan.query.filter_by(user_id=user.id, month_year=current_month).first()
    health_score = calculate_health_score(user, total_income, total_expenses, savings_rate, goals, budget_plan)

    insights = ai_engine.generate_monthly_insight(
        profile_type=user.profile_type,
        currency=user.currency,
        total_income=total_income,
        total_expenses=total_expenses,
        category_summary=category_summary,
        goals=[g.to_dict() for g in goals]
    )

    report_data = {
        "month_year": current_month,
        "currency": user.currency,
        "profile_type": user.profile_type,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_savings": net_savings,
        "savings_rate": savings_rate,
        "health_score": health_score,
        "category_summary": category_summary,
        "goals": [g.to_dict() for g in goals],
        "ai_insights": insights
    }
    return jsonify(report_data)


@app.route('/api/chat', methods=['POST'])
def chat():
    user = get_default_user()
    data = request.json or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({"reply": "Please ask a question about your personal finances!"})

    incomes = [i.to_dict() for i in Income.query.filter_by(user_id=user.id).all()]
    expenses = [e.to_dict() for e in Expense.query.filter_by(user_id=user.id).all()]
    goals = [g.to_dict() for g in Goal.query.filter_by(user_id=user.id).all()]
    budget = BudgetPlan.query.filter_by(user_id=user.id).first()

    context = {
        "user": user.to_dict(),
        "incomes": incomes,
        "expenses": expenses,
        "goals": goals,
        "budget": budget.plan_data if budget else {}
    }

    reply = ai_engine.answer_chat_advisor(message, context)
    return jsonify({"reply": reply})


@app.route('/api/demo-data', methods=['POST'])
def load_demo_data():
    """Seed comprehensive realistic data for the selected or default profile."""
    data = request.json or {}
    profile_type = data.get('profile_type', 'Salaried Professional')
    user = get_default_user()
    user.profile_type = profile_type

    # Clear old data
    Income.query.filter_by(user_id=user.id).delete()
    Expense.query.filter_by(user_id=user.id).delete()
    Goal.query.filter_by(user_id=user.id).delete()
    BudgetPlan.query.filter_by(user_id=user.id).delete()
    MonthlyReport.query.filter_by(user_id=user.id).delete()

    today = date.today()

    if profile_type == "Freelancer":
        user.monthly_income = 110000.0
        # Incomes
        incomes = [
            Income(user_id=user.id, source="Fintech UI Redesign", client_name="Acme Corp", amount=45000, income_type="variable", frequency="project-based", date_received=today - timedelta(days=2)),
            Income(user_id=user.id, source="Mobile App Consultation", client_name="NeoBank Labs", amount=35000, income_type="variable", frequency="project-based", date_received=today - timedelta(days=10)),
            Income(user_id=user.id, source="Monthly Maintenance Retainer", client_name="Starlight Media", amount=30000, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=18))
        ]
        # Expenses
        expenses = [
            Expense(user_id=user.id, amount=22000, category="Rent", note="Studio Apartment Rent", date_incurred=today - timedelta(days=25)),
            Expense(user_id=user.id, amount=9400, category="Groceries", note="Organic groceries & meal prep", date_incurred=today - timedelta(days=5)),
            Expense(user_id=user.id, amount=6500, category="Food", note="Client dinners & coffee shops", date_incurred=today - timedelta(days=3)),
            Expense(user_id=user.id, amount=3800, category="Utilities", note="High-speed Fiber & Cloud tools", date_incurred=today - timedelta(days=8)),
            Expense(user_id=user.id, amount=4200, category="Transport", note="Rideshare & fuel", date_incurred=today - timedelta(days=4)),
            Expense(user_id=user.id, amount=7500, category="Healthcare", note="Health insurance premium", date_incurred=today - timedelta(days=12)),
            Expense(user_id=user.id, amount=5200, category="Entertainment", note="Streaming & Weekend leisure", date_incurred=today - timedelta(days=6)),
            Expense(user_id=user.id, amount=6000, category="Shopping", note="Ergonomic desk accessories", date_incurred=today - timedelta(days=1))
        ]
        # Goals
        goals = [
            Goal(user_id=user.id, title="6-Month Lean Emergency Runway", target_amount=300000, current_amount=165000, deadline=today + timedelta(days=120), category="Emergency", icon="Shield"),
            Goal(user_id=user.id, title="M3 Max MacBook Pro Upgrade", target_amount=180000, current_amount=82000, deadline=today + timedelta(days=90), category="Purchase", icon="Laptop"),
            Goal(user_id=user.id, title="Quarterly Advance Tax Fund", target_amount=75000, current_amount=50000, deadline=today + timedelta(days=45), category="Savings", icon="Briefcase")
        ]

    elif profile_type == "College Student":
        user.monthly_income = 25000.0
        incomes = [
            Income(user_id=user.id, source="Monthly Parental Allowance", client_name="Family", amount=18000, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=3)),
            Income(user_id=user.id, source="Campus Tutoring Stipend", client_name="Department of CS", amount=7000, income_type="variable", frequency="monthly", date_received=today - timedelta(days=15))
        ]
        expenses = [
            Expense(user_id=user.id, amount=6500, category="Food", note="Campus cafeteria & midnight snacks", date_incurred=today - timedelta(days=2)),
            Expense(user_id=user.id, amount=4500, category="Education", note="Semester coursebooks & lab kit", date_incurred=today - timedelta(days=12)),
            Expense(user_id=user.id, amount=2200, category="Transport", note="Metro student pass", date_incurred=today - timedelta(days=20)),
            Expense(user_id=user.id, amount=2800, category="Entertainment", note="Movie outing with batchmates", date_incurred=today - timedelta(days=4)),
            Expense(user_id=user.id, amount=1800, category="Shopping", note="Stationery & backpack", date_incurred=today - timedelta(days=7)),
            Expense(user_id=user.id, amount=1200, category="Utilities", note="Mobile data top-up", date_incurred=today - timedelta(days=14))
        ]
        goals = [
            Goal(user_id=user.id, title="Student Goa Trip with Friends", target_amount=20000, current_amount=14000, deadline=today + timedelta(days=60), category="Travel", icon="Plane"),
            Goal(user_id=user.id, title="Noise-Cancelling Headphones", target_amount=12000, current_amount=5500, deadline=today + timedelta(days=90), category="Purchase", icon="Headphones"),
            Goal(user_id=user.id, title="Allowance Safety Buffer", target_amount=10000, current_amount=7000, deadline=today + timedelta(days=30), category="Savings", icon="PiggyBank")
        ]

    elif profile_type == "Household Manager":
        user.monthly_income = 95000.0
        incomes = [
            Income(user_id=user.id, source="Primary Household Contribution", client_name="Partner / Joint", amount=70000, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=1)),
            Income(user_id=user.id, source="Rental Property Inflow", client_name="Apartment 3B", amount=25000, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=5))
        ]
        expenses = [
            Expense(user_id=user.id, amount=24000, category="Groceries", note="Wholesale monthly family pantry", date_incurred=today - timedelta(days=2)),
            Expense(user_id=user.id, amount=22000, category="Rent", note="Society Maintenance & Base Rent", date_incurred=today - timedelta(days=25)),
            Expense(user_id=user.id, amount=9800, category="Utilities", note="Electricity, LPG, Water & Gas", date_incurred=today - timedelta(days=10)),
            Expense(user_id=user.id, amount=11000, category="Education", note="Children school fees & transport", date_incurred=today - timedelta(days=15)),
            Expense(user_id=user.id, amount=5500, category="Healthcare", note="Family prescription & dental", date_incurred=today - timedelta(days=8)),
            Expense(user_id=user.id, amount=4800, category="Transport", note="School commute & car fuel", date_incurred=today - timedelta(days=3))
        ]
        goals = [
            Goal(user_id=user.id, title="Family Emergency Health Sinking Fund", target_amount=250000, current_amount=175000, deadline=today + timedelta(days=180), category="Emergency", icon="Shield"),
            Goal(user_id=user.id, title="Annual Family Vacation", target_amount=120000, current_amount=60000, deadline=today + timedelta(days=150), category="Travel", icon="Umbrella"),
            Goal(user_id=user.id, title="Home Solar Inverter Upgrade", target_amount=80000, current_amount=35000, deadline=today + timedelta(days=90), category="Purchase", icon="Home")
        ]

    else: # Salaried Professional
        user.monthly_income = 85000.0
        incomes = [
            Income(user_id=user.id, source="Senior Software Engineer Salary", client_name="Tech Corp", amount=85000, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=1))
        ]
        expenses = [
            Expense(user_id=user.id, amount=25000, category="Rent", note="1BHK Apartment in Indiranagar", date_incurred=today - timedelta(days=28)),
            Expense(user_id=user.id, amount=9500, category="Food", note="Swiggy, gourmet cafes, work lunches", date_incurred=today - timedelta(days=3)),
            Expense(user_id=user.id, amount=8200, category="Groceries", note="Blinkit & Nature's Basket staples", date_incurred=today - timedelta(days=6)),
            Expense(user_id=user.id, amount=4800, category="Transport", note="Metro card & Uber rides", date_incurred=today - timedelta(days=4)),
            Expense(user_id=user.id, amount=3500, category="Utilities", note="Airtel Broadband, Power & Water", date_incurred=today - timedelta(days=14)),
            Expense(user_id=user.id, amount=6200, category="Entertainment", note="Concert ticket & OTT platforms", date_incurred=today - timedelta(days=9)),
            Expense(user_id=user.id, amount=4500, category="Shopping", note="Sneakers & wardrobe refresh", date_incurred=today - timedelta(days=11)),
            Expense(user_id=user.id, amount=2500, category="Healthcare", note="Gym membership & vitamins", date_incurred=today - timedelta(days=16))
        ]
        goals = [
            Goal(user_id=user.id, title="6-Month Emergency Fund", target_amount=250000, current_amount=150000, deadline=today + timedelta(days=150), category="Emergency", icon="Shield"),
            Goal(user_id=user.id, title="Japan Autumn Trip 2027", target_amount=180000, current_amount=72000, deadline=today + timedelta(days=240), category="Travel", icon="Plane"),
            Goal(user_id=user.id, title="Down Payment Wealth Pool", target_amount=500000, current_amount=180000, deadline=today + timedelta(days=365), category="Savings", icon="Home")
        ]

    for inc in incomes:
        db.session.add(inc)
    for exp in expenses:
        db.session.add(exp)
    for g in goals:
        db.session.add(g)

    # Generate budget
    plan_dict = ai_engine.generate_budget_plan(
        user.profile_type, user.monthly_income, user.currency, 
        [e.to_dict() for e in expenses], [g.to_dict() for g in goals]
    )
    b_plan = BudgetPlan(user_id=user.id, month_year=today.strftime("%Y-%m"), plan_data=plan_dict, strategy_note=plan_dict.get("strategy_note", ""))
    db.session.add(b_plan)

    db.session.commit()
    return jsonify({"success": True, "message": f"Loaded demo data for {profile_type}!"})


with app.app_context():
    db.create_all()
    # Check if empty, populate initial default user
    if not User.query.first():
        get_default_user()


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
