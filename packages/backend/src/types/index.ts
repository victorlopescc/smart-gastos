export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  userId?: string;
}

export interface Budget {
  id: string;
  month: string; // formato: YYYY-MM
  totalBudget: number;
  userId?: string;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  nextPayment: string;
  status: 'Ativa' | 'Pendente' | 'Cancelada';
  userId?: string;
}

export interface CategorySummary {
  category: string;
  totalSpent: number;
  percentage: number;
  expenseCount: number;
}

export interface DashboardData {
  budget: Budget | null;
  totalSpent: number;
  remaining: number;
  expenses: Expense[];
  categoryChart: CategorySummary[];
  recentExpenses: Expense[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
