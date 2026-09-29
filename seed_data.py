"""
FinPilot - Standalone Database Seed Script
Run with: python seed_data.py
Populates sample profiles, income streams, expenses, goals, and AI budget plans.
"""

import os
from datetime import date, timedelta
from app import app, db
from models import User, Income, Expense, Goal, BudgetPlan
import ai_engine

def seed():
    with app.app_context():
        print("🌱 Seeding FinPilot database...")
        db.drop_all()
        db.create_all()

        today = date.today()

        # 1. Create Default User (Salaried Professional)
        user = User(
            name="Alex Morgan",
            profile_type="Salaried Professional",
            monthly_income=85000.0,
            currency="₹"
        )
        db.session.add(user)
        db.session.commit()

        # 2. Add Incomes
        incomes = [
            Income(user_id=user.id, source="Senior Engineer Salary", client_name="Fintech Corp", amount=85000.0, income_type="fixed", frequency="monthly", date_received=today - timedelta(days=1)),
            Income(user_id=user.id, source="Tech Writing Advisory", client_name="Substack", amount=12000.0, income_type="variable", frequency="one-time", date_received=today - timedelta(days=14))
        ]
        for inc in incomes:
            db.session.add(inc)

        # 3. Add Expenses
        expenses = [
            Expense(user_id=user.id, amount=25000, category="Rent", note="1BHK Apartment in Indiranagar", date_incurred=today - timedelta(days=28)),
            Expense(user_id=user.id, amount=9500, category="Food", note="Swiggy gourmet cafes, work lunches", date_incurred=today - timedelta(days=3)),
            Expense(user_id=user.id, amount=8200, category="Groceries", note="Blinkit & Nature's Basket staples", date_incurred=today - timedelta(days=6)),
            Expense(user_id=user.id, amount=4800, category="Transport", note="Metro card & Uber rides", date_incurred=today - timedelta(days=4)),
            Expense(user_id=user.id, amount=3500, category="Utilities", note="Airtel Broadband, Power & Water", date_incurred=today - timedelta(days=14)),
            Expense(user_id=user.id, amount=6200, category="Entertainment", note="Concert ticket & OTT platforms", date_incurred=today - timedelta(days=9)),
            Expense(user_id=user.id, amount=4500, category="Shopping", note="Sneakers & wardrobe refresh", date_incurred=today - timedelta(days=11)),
            Expense(user_id=user.id, amount=2500, category="Healthcare", note="Gym membership & vitamins", date_incurred=today - timedelta(days=16))
        ]
        for exp in expenses:
            db.session.add(exp)

        # 4. Add Goals
        goals = [
            Goal(user_id=user.id, title="6-Month Emergency Runway", target_amount=250000, current_amount=155000, deadline=today + timedelta(days=150), category="Emergency", icon="Shield"),
            Goal(user_id=user.id, title="Japan Autumn Trip 2027", target_amount=180000, current_amount=72000, deadline=today + timedelta(days=240), category="Travel", icon="Plane"),
            Goal(user_id=user.id, title="Down Payment Wealth Pool", target_amount=500000, current_amount=180000, deadline=today + timedelta(days=365), category="Savings", icon="Home")
        ]
        for g in goals:
            db.session.add(g)

        # 5. Generate Initial AI Budget Plan
        budget_dict = ai_engine.generate_budget_plan(
            user.profile_type, user.monthly_income, user.currency,
            [e.to_dict() for e in expenses], [g.to_dict() for g in goals]
        )
        plan = BudgetPlan(
            user_id=user.id,
            month_year=today.strftime("%Y-%m"),
            plan_data=budget_dict,
            strategy_note=budget_dict.get("strategy_note", ""),
            generated_by_ai=True
        )
        db.session.add(plan)
        db.session.commit()
        print("✅ FinPilot seed completed successfully with realistic records!")

if __name__ == "__main__":
    seed()
