// Tipos de dados da aplicação
export interface Category {
  name: string;
  value: number;
  color: string;
}

export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface MonthlyData {
  budget: number;
  spent: number;
  categories: Category[];
  recentExpenses: Expense[];
}

export interface Subscription {
  id: number;
  name: string;
  category: string;
  amount: number;
  nextPayment: string;
  status: 'Ativa' | 'Pendente' | 'Cancelada';
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
}

export interface MonthlyReport {
  month: string;
  budget: number;
  spent: number;
  saved: number;
  categories: Category[];
}

export interface UserData {
  name: string;
  email: string;
  avatar: string | null;
  memberSince: string;
  preferences: {
    currency: string;
    notifications: boolean;
    darkMode: boolean;
  };
}

export interface ReportData {
  trends: MonthlyReport[];
  period: string;
  subscriptionAnalytics: {
    totalMonthly: number;
    activeCount: number;
    averageCost: number;
    categoryBreakdown: { [key: string]: number };
    annualProjection: number;
  };
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
