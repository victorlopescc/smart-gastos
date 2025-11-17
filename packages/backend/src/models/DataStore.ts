import { Expense, Budget, CategorySummary, Subscription } from '../types';
import { v4 as uuidv4 } from 'uuid';

class DataStore {
  private expenses: Expense[] = [];
  private budgets: Budget[] = [];
  private subscriptions: Subscription[] = [];

  // Método para adicionar uma despesa
  addExpense(expenseData: Omit<Expense, 'id'>): Expense {
    const expense: Expense = {
      id: uuidv4(),
      ...expenseData
    };
    this.expenses.push(expense);
    return expense;
  }

  // Método para obter todas as despesas
  getAllExpenses(): Expense[] {
    return [...this.expenses];
  }

  // Método para obter despesas por mês
  getExpensesByMonth(month: string): Expense[] {
    return this.expenses.filter(expense => {
      const expenseMonth = expense.date.substring(0, 7); // YYYY-MM
      return expenseMonth === month;
    });
  }

  // Método para obter despesas recentes (todas do mês)
  getRecentExpenses(month: string): Expense[] {
    const monthExpenses = this.getExpensesByMonth(month);
    const subscriptionExpenses = this.getSubscriptionExpenses(month);
    const allExpenses = [...monthExpenses, ...subscriptionExpenses];

    return allExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Método para definir orçamento
  setBudget(budgetData: Omit<Budget, 'id'>): Budget {
    const existingBudgetIndex = this.budgets.findIndex(
      budget => budget.month === budgetData.month
    );

    if (existingBudgetIndex !== -1) {
      this.budgets[existingBudgetIndex] = {
        ...this.budgets[existingBudgetIndex],
        ...budgetData
      };
      return this.budgets[existingBudgetIndex]!;
    } else {
      const budget: Budget = {
        id: uuidv4(),
        ...budgetData
      };
      this.budgets.push(budget);
      return budget;
    }
  }

  // Método para obter orçamento por mês
  getBudgetByMonth(month: string): Budget | null {
    return this.budgets.find(budget => budget.month === month) || null;
  }

  // Métodos para gerenciar assinaturas
  addSubscription(subscriptionData: Omit<Subscription, 'id'>): Subscription {
    const subscription: Subscription = {
      id: uuidv4(),
      ...subscriptionData
    };
    this.subscriptions.push(subscription);
    return subscription;
  }

  getAllSubscriptions(): Subscription[] {
    return [...this.subscriptions];
  }

  getSubscriptionById(id: string): Subscription | null {
    return this.subscriptions.find(subscription => subscription.id === id) || null;
  }

  updateSubscription(id: string, updates: Partial<Omit<Subscription, 'id'>>): Subscription | null {
    const index = this.subscriptions.findIndex(subscription => subscription.id === id);
    if (index !== -1) {
      this.subscriptions[index] = { ...this.subscriptions[index], ...updates };
      return this.subscriptions[index]!;
    }
    return null;
  }

  deleteSubscription(id: string): boolean {
    const index = this.subscriptions.findIndex(subscription => subscription.id === id);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
      return true;
    }
    return false;
  }

  getActiveSubscriptions(): Subscription[] {
    return this.subscriptions.filter(subscription => subscription.status === 'Ativa');
  }

  // Método para converter assinaturas ativas em despesas mensais
  getSubscriptionExpenses(month: string): Expense[] {
    const activeSubscriptions = this.getActiveSubscriptions();

    return activeSubscriptions.map(subscription => ({
      id: `sub-${subscription.id}`,
      description: `Assinatura ${subscription.name}`,
      category: subscription.category,
      amount: subscription.amount,
      date: subscription.nextPayment // Usar a data real de nextPayment
    }));
  }

  // Método para obter total gasto em assinaturas ativas
  getTotalSubscriptionCost(): number {
    return this.getActiveSubscriptions()
      .reduce((total, subscription) => total + subscription.amount, 0);
  }

  // Atualizar método getCategorySummary para incluir assinaturas
  getCategorySummary(month: string): CategorySummary[] {
    const monthExpenses = this.getExpensesByMonth(month);
    const subscriptionExpenses = this.getSubscriptionExpenses(month);
    const allExpenses = [...monthExpenses, ...subscriptionExpenses];

    const totalSpent = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const categoryMap = new Map<string, { total: number; count: number }>();

    allExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      totalSpent: data.total,
      percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      expenseCount: data.count
    })).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  // Método para deletar uma despesa
  deleteExpense(id: string): boolean {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      return true;
    }
    return false;
  }

  // Método para atualizar uma despesa
  updateExpense(id: string, updates: Partial<Omit<Expense, 'id'>>): Expense | null {
    const index = this.expenses.findIndex(expense => expense.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...updates };
      return this.expenses[index]!;
    }
    return null;
  }
}

// Instância única do data store (singleton)
export const dataStore = new DataStore();
