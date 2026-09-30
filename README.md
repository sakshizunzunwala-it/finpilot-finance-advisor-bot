# FinPilot – Personal Finance Advisor Bot

AI-powered personal finance assistant built with Flask, SQLite and Google Gemini. It helps you track income and expenses, get smart budget plans, and receive personalized saving tips.

## Live Demo
https://finpilot-money-planner.ai.studio

## Features
- Income and expense tracking with categories
- AI budget plan (50/30/20 style) with overspending alerts
- AI saving suggestions
- Financial goals tracking
- Monthly summary report with print/PDF option
- AI chat advisor that uses your real data
- Financial health score and "Safe to Spend Today" card
- Profiles for Salaried Professional, College Student, Freelancer and Household Manager


## Tech Stack
- Backend: Python, Flask, SQLAlchemy, SQLite
- AI: Google Gemini API
- Frontend: HTML, CSS, JavaScript, Chart.js
- 
## Documentation
📄 [Click here to view the full project documentation](FinPilot_Documentation%20sak.docx)

## How to Run Locally
1. Clone the repository:
   git clone https://github.com/sakshizunzunwala-it/finpilot-finance-advisor-bot.git
2. Go into the folder:
   cd finpilot-finance-advisor-bot
3. Install the requirements:
   pip install -r requirements.txt
4. Copy .env.example to .env and add your Gemini API key:
   GEMINI_API_KEY=your_key_here
5. Add sample data (optional):
   python seed_data.py
6. Start the app:
   python app.py
7. Open http://localhost:5000 in your browser

## License
Apache-2.0
