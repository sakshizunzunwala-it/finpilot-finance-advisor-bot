import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface PythonSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonSourceModal: React.FC<PythonSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, { label: string; code: string; desc: string }> = {
    'app.py': {
      label: 'app.py (Flask Server & REST API)',
      desc: 'Complete Flask server with SQLite, CORS, and RESTful endpoints for income, expenses, budget, goals, report, and Gemini chat.',
      code: `import os
from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from models import db, User, Income, Expense, Goal, BudgetPlan, MonthlyReport
import ai_engine

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'finpilot.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/profile', methods=['GET', 'PUT'])
def handle_profile():
    # User Profile REST route
    ...

@app.route('/api/chat', methods=['POST'])
def chat():
    # Context-aware Gemini AI Advisor
    ...

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)`
    },
    'models.py': {
      label: 'models.py (SQLAlchemy Schema)',
      desc: 'Relational SQLite models for User, Income, Expense, Goal, BudgetPlan, and MonthlyReport.',
      code: `from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), default="FinPilot User")
    profile_type = db.Column(db.String(50), default="Salaried Professional")
    monthly_income = db.Column(db.Float, default=75000.0)
    currency = db.Column(db.String(10), default="₹")

class Income(db.Model):
    __tablename__ = 'incomes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    source = db.Column(db.String(120), nullable=False)
    client_name = db.Column(db.String(120), nullable=True) # for Freelancers
    amount = db.Column(db.Float, nullable=False)
    income_type = db.Column(db.String(50), default="fixed")

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date_incurred = db.Column(db.Date, default=date.today)
    note = db.Column(db.String(255))`
    },
    'ai_engine.py': {
      label: 'ai_engine.py (Gemini Engine & Prompts)',
      desc: 'Prompt templates, forced JSON schemas, overspending detectors, and graceful 50/30/20 fallback generator.',
      code: `import os, json, re
from typing import Dict, Any, List
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_budget_plan(profile_type, monthly_income, currency, expenses, goals):
    # Gemini prompt + JSON output + 50/30/20 rule fallback
    ...

def answer_chat_advisor(user_question, context):
    # Live context-aware answer for "Can I afford a ₹40,000 phone?"
    ...`
    },
    'requirements.txt': {
      label: 'requirements.txt',
      desc: 'Required Python libraries for Flask backend and Google Gemini SDK.',
      code: `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Flask-Cors==4.0.0
google-generativeai==0.8.4
python-dotenv==1.0.1
werkzeug==3.0.1`
    },
    'run_instructions': {
      label: 'Terminal Run Commands',
      desc: 'Commands to set up virtual environment and execute the Flask application locally.',
      code: `# 1. Clone & Enter Directory
cd finpilot

# 2. Set Up Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# 3. Install Dependencies
pip install -r requirements.txt

# 4. Set Gemini API Key in .env
export GEMINI_API_KEY="your-gemini-key"

# 5. Populate Sample Database
python seed_data.py

# 6. Launch FinPilot Flask Server
python app.py
# Server will start on http://127.0.0.1:5000`
    }
  };

  const currentFile = files[activeFile] || files['app.py'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Python + Flask Backend Code Repository
              </h3>
              <p className="text-[11px] text-slate-400">
                Ready-to-run source code with SQLAlchemy & Google Gemini SDK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy File'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Tabs */}
        <div className="bg-slate-900/40 border-b border-slate-800 px-4 flex gap-1.5 overflow-x-auto shrink-0 py-2">
          {Object.entries(files).map(([key, f]) => (
            <button
              key={key}
              onClick={() => {
                setActiveFile(key);
                setCopied(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFile === key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Description Banner */}
        <div className="px-5 py-2.5 bg-slate-900/20 border-b border-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
          <span>{currentFile.desc}</span>
          <span className="text-[11px] text-violet-400 font-mono">
            {activeFile.endsWith('.py') ? 'Python 3.10+' : 'Terminal / Config'}
          </span>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed selection:bg-violet-600/30">
          <pre className="whitespace-pre-wrap">{currentFile.code}</pre>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            All files are placed in root: <code className="text-violet-300">/app.py</code>, <code className="text-violet-300">/models.py</code>, <code className="text-violet-300">/ai_engine.py</code>
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
