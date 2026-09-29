# FinPilot – Personal Finance Advisor Bot 🚀

**FinPilot** is a production-quality, AI-powered personal finance assistant designed with modern fintech glassmorphism aesthetics. It delivers adaptive 50/30/20 budgeting, real-time expense and income tracking, actionable AI saving recommendations, scenario-aware insights, and an intelligent conversational chat advisor backed by the Google Gemini API.

---

## 🌟 Key Features

1. **Smart Onboarding & Profile Customization**:
   - Four distinct persona profiles: **Salaried Professional**, **College Student**, **Freelancer**, and **Household Manager**.
   - Custom currency symbol (Default: INR `₹`, supports `$`, `€`, `£`).
   - Dynamic monthly baseline budget.

2. **Income & Multi-Client Tracking**:
   - Fixed and variable income entries.
   - Dedicated client tracking for freelancers and multiple income streams.

3. **Expense Logging & Ledger**:
   - Comprehensive category taxonomy (Rent, Food, Transport, Entertainment, Groceries, Utilities, Education, Healthcare, Shopping, Other).
   - Full edit, delete, and real-time ledger updates.

4. **AI Budget Plan Generator (50/30/20 Adaptive)**:
   - Evaluates your active persona and spending velocity.
   - Calculates category-wise limits with instant overspending warning alerts.

5. **AI Savings Recommendations**:
   - Concrete mathematical tips (e.g. *"You spent 32% on food; reducing it by ₹2,000 saves ₹24,000/year"*).

6. **Executive Monthly Report**:
   - Visual breakdown of income, expenses, and net surplus.
   - AI-written executive summary paragraph.
   - **Download as PDF / Print** button with clean printable CSS formatting.

7. **Context-Aware AI Chat Advisor Widget**:
   - Floating interactive assistant with real-time access to your live finances.
   - Answers specific scenario queries like *"Can I afford a ₹40,000 phone this month?"* with step-by-step math.

8. **Scenario-Aware Rules**:
   - **Freelancers**: 6-month lean runway calculation and tax buffer suggestions.
   - **College Students**: Daily allowance tracking, campus discount alerts.
   - **Household Managers**: Pantry bulk buy optimization and family health sinking fund.

9. **Fintech Glassmorphism UI**:
   - Animated "Safe to Spend Today" hero counter.
   - Category Donut Chart and 6-Month Trend Line Chart.
   - Financial Health Score gauge (0–100).
   - Light / Dark mode toggle.
   - One-click **"Load Demo Data"** button.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Flask, SQLAlchemy ORM, SQLite database
- **AI Engine**: Google Gemini API (`google-generativeai` SDK / `@google/genai`)
- **Frontend**: HTML5, Modern Glassmorphism CSS, Vanilla JavaScript, Chart.js, Tailwind CSS

---

## 🚀 Step-by-Step Run Instructions (Python / Flask)

### 1. Clone & Set Up Virtual Environment
```bash
# Clone the repository
git clone <repo_url>
cd finpilot

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your Google Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=5000
FLASK_ENV=development
```

### 4. Seed Database (Optional but Recommended)
To pre-populate realistic sample data:
```bash
python seed_data.py
```

### 5. Launch the Server
```bash
flask run --port=5000
# or
python app.py
```
Open your browser and navigate to: `http://localhost:5000`

---

## 📸 Screenshots & UI Preview

- **Financial Dashboard**: Animated Safe to Spend Today hero counter, Category Donut Chart, 6-Month Trend Line, and Financial Health Score (0-100).
- **AI Budget Planner**: Adaptive 50/30/20 breakdown with real-time overspending alerts.
- **AI Advisor Bot**: Expandable chat widget with contextual financial sanity checks.
- **Monthly Report**: Executive summary with instant one-click PDF printing.

---

## 🛡️ License
Apache-2.0
