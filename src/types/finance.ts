export type ProfileType = 
  | 'Salaried Professional' 
  | 'College Student' 
  | 'Freelancer' 
  | 'Household Manager';

export interface UserProfile {
  name: string;
  profile_type: ProfileType;
  monthly_income: number;
  currency: string;
}

export interface IncomeItem {
  id: number;
  source: string;
  client_name?: string;
  amount: number;
  income_type: 'fixed' | 'variable';
  frequency: 'monthly' | 'one-time' | 'project-based';
  date_received: string;
}

export type ExpenseCategory = 
  | 'Rent' 
  | 'Food' 
  | 'Transport' 
  | 'Entertainment' 
  | 'Groceries' 
  | 'Utilities' 
  | 'Education' 
  | 'Healthcare' 
  | 'Shopping' 
  | 'Other';

export interface ExpenseItem {
  id: number;
  amount: number;
  category: ExpenseCategory;
  date_incurred: string;
  note: string;
  payment_method: string;
}

export interface GoalItem {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: 'Emergency' | 'Savings' | 'Purchase' | 'Travel' | 'General';
  icon: string;
}

export interface BudgetAllocation {
  percentage: number;
  amount: number;
}

export interface OverspendingAlert {
  category: string;
  spent: number;
  limit: number;
  overspend: number;
  message: string;
}

export interface BudgetPlanData {
  monthly_income: number;
  profile_type: string;
  currency: string;
  allocations: {
    needs: BudgetAllocation;
    wants: BudgetAllocation;
    savings: BudgetAllocation;
  };
  category_limits: Record<string, number>;
  strategy_note: string;
  overspending_alerts: OverspendingAlert[];
}

export interface SavingSuggestion {
  title: string;
  category: string;
  impact: 'Critical' | 'High' | 'Medium';
  annual_savings: string;
  tip: string;
}

export interface MonthlyReportData {
  month_year: string;
  currency: string;
  profile_type: string;
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  health_score: number;
  category_summary: Record<string, number>;
  goals: GoalItem[];
  ai_insights: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
