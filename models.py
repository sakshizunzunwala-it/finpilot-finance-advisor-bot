"""
FinPilot - Personal Finance Advisor Bot
SQLAlchemy Models for User, Income, Expense, Goal, BudgetPlan, MonthlyReport
"""

from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="FinPilot User")
    profile_type = db.Column(
        db.String(50), 
        nullable=False, 
        default="Salaried Professional"
    ) # Salaried Professional, College Student, Freelancer, Household Manager
    monthly_income = db.Column(db.Float, nullable=False, default=75000.0)
    currency = db.Column(db.String(10), nullable=False, default="₹")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    incomes = db.relationship('Income', backref='user', lazy=True, cascade="all, delete-orphan")
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade="all, delete-orphan")
    goals = db.relationship('Goal', backref='user', lazy=True, cascade="all, delete-orphan")
    budget_plans = db.relationship('BudgetPlan', backref='user', lazy=True, cascade="all, delete-orphan")
    reports = db.relationship('MonthlyReport', backref='user', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "profile_type": self.profile_type,
            "monthly_income": self.monthly_income,
            "currency": self.currency,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Income(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    source = db.Column(db.String(120), nullable=False)
    client_name = db.Column(db.String(120), nullable=True) # for Freelancers
    amount = db.Column(db.Float, nullable=False)
    income_type = db.Column(db.String(50), default="fixed") # fixed, variable
    frequency = db.Column(db.String(50), default="monthly") # monthly, one-time, project-based
    date_received = db.Column(db.Date, nullable=False, default=date.today)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "source": self.source,
            "client_name": self.client_name,
            "amount": self.amount,
            "income_type": self.income_type,
            "frequency": self.frequency,
            "date_received": self.date_received.isoformat() if self.date_received else None,
            "notes": self.notes
        }


class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False) 
    # Categories: Rent, Food, Transport, Entertainment, Groceries, Utilities, Education, Healthcare, Shopping, Other
    date_incurred = db.Column(db.Date, nullable=False, default=date.today)
    note = db.Column(db.String(255), nullable=True)
    payment_method = db.Column(db.String(50), default="UPI/Card")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "category": self.category,
            "date_incurred": self.date_incurred.isoformat() if self.date_incurred else None,
            "note": self.note,
            "payment_method": self.payment_method
        }


class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False) # Emergency Fund, Trip to Goa, New MacBook
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(50), default="General") # Emergency, Savings, Purchase, Travel
    icon = db.Column(db.String(50), default="Target")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        progress = round((self.current_amount / self.target_amount) * 100, 1) if self.target_amount > 0 else 0
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "target_amount": self.target_amount,
            "current_amount": self.current_amount,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "category": self.category,
            "icon": self.icon,
            "progress_percentage": min(100.0, progress)
        }


class BudgetPlan(db.Model):
    __tablename__ = 'budget_plans'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    month_year = db.Column(db.String(20), nullable=False) # e.g. "2026-09"
    plan_data = db.Column(db.JSON, nullable=False) 
    # structured: { "needs": {...}, "wants": {...}, "savings": {...}, "category_limits": {...} }
    strategy_note = db.Column(db.Text, nullable=True)
    generated_by_ai = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "month_year": self.month_year,
            "plan_data": self.plan_data,
            "strategy_note": self.strategy_note,
            "generated_by_ai": self.generated_by_ai,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class MonthlyReport(db.Model):
    __tablename__ = 'monthly_reports'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    month_year = db.Column(db.String(20), nullable=False) # "2026-09"
    total_income = db.Column(db.Float, default=0.0)
    total_expenses = db.Column(db.Float, default=0.0)
    net_savings = db.Column(db.Float, default=0.0)
    savings_rate = db.Column(db.Float, default=0.0)
    health_score = db.Column(db.Integer, default=70)
    ai_insights = db.Column(db.Text, nullable=True)
    category_summary = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "month_year": self.month_year,
            "total_income": self.total_income,
            "total_expenses": self.total_expenses,
            "net_savings": self.net_savings,
            "savings_rate": self.savings_rate,
            "health_score": self.health_score,
            "ai_insights": self.ai_insights,
            "category_summary": self.category_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
