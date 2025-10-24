// Configuração base da API
const API_BASE_URL = 'http://localhost:3001/api';

// Tipos para as respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BackendExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  userId?: string;
}

export interface BackendBudget {
  id: string;
  month: string; // formato: YYYY-MM
  totalBudget: number;
  userId?: string;
}

export interface CategorySummary {
  category: string;
  totalSpent: number;
  percentage: number;
  expenseCount: number;
}

export interface DashboardData {
  budget: BackendBudget | null;
  totalSpent: number;
  remaining: number;
  expenses: BackendExpense[];
  categoryChart: CategorySummary[];
  recentExpenses: BackendExpense[];
}

export interface BackendSubscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  nextPayment: string;
  status: 'Ativa' | 'Pendente' | 'Cancelada';
  userId?: string;
}

// Funções para comunicação com o backend
export const apiService = {
  // Obter dados completos do dashboard
  async getDashboardData(month?: string): Promise<ApiResponse<DashboardData>> {
    const url = month
      ? `${API_BASE_URL}/dashboard?month=${month}`
      : `${API_BASE_URL}/dashboard`;

    const response = await fetch(url);
    return response.json();
  },

  // Definir/atualizar orçamento
  async setBudget(month: string, totalBudget: number): Promise<ApiResponse<BackendBudget>> {
    const response = await fetch(`${API_BASE_URL}/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ month, totalBudget }),
    });
    return response.json();
  },

  // Adicionar nova despesa
  async addExpense(expense: {
    amount: number;
    description: string;
    category: string;
    date: string;
  }): Promise<ApiResponse<BackendExpense>> {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });
    return response.json();
  },

  // Obter resumo por categoria
  async getCategorySummary(month?: string): Promise<ApiResponse<CategorySummary[]>> {
    const url = month
      ? `${API_BASE_URL}/categories/summary?month=${month}`
      : `${API_BASE_URL}/categories/summary`;

    const response = await fetch(url);
    return response.json();
  },

  // Obter despesas recentes
  async getRecentExpenses(month?: string): Promise<ApiResponse<BackendExpense[]>> {
    const url = month
      ? `${API_BASE_URL}/expenses/recent?month=${month}`
      : `${API_BASE_URL}/expenses/recent`;

    const response = await fetch(url);
    return response.json();
  },

  // Deletar despesa
  async deleteExpense(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await fetch(`http://localhost:3001/health`);
    return response.json();
  },

  // === ASSINATURAS ===
  
  // Obter todas as assinaturas
  async getAllSubscriptions(): Promise<ApiResponse<BackendSubscription[]>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions`);
    return response.json();
  },

  // Obter assinaturas ativas
  async getActiveSubscriptions(): Promise<ApiResponse<BackendSubscription[]>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/active`);
    return response.json();
  },

  // Obter total gasto em assinaturas
  async getTotalSubscriptionCost(): Promise<ApiResponse<{ totalCost: number }>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/total-cost`);
    return response.json();
  },

  // Adicionar nova assinatura
  async addSubscription(subscription: {
    name: string;
    category: string;
    amount: number;
    nextPayment: string;
    status?: 'Ativa' | 'Pendente' | 'Cancelada';
  }): Promise<ApiResponse<BackendSubscription>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    return response.json();
  },

  // Atualizar assinatura
  async updateSubscription(id: string, updates: {
    name?: string;
    category?: string;
    amount?: number;
    nextPayment?: string;
    status?: 'Ativa' | 'Pendente' | 'Cancelada';
  }): Promise<ApiResponse<BackendSubscription>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Deletar assinatura
  async deleteSubscription(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Obter assinatura por ID
  async getSubscriptionById(id: string): Promise<ApiResponse<BackendSubscription>> {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`);
    return response.json();
  },
};

// Utilitários para conversão entre tipos do frontend e backend
export const converters = {
  // Converter expense do backend para o tipo do frontend
  backendToFrontendExpense(backendExpense: BackendExpense): import('../types').Expense {
    // Se é uma assinatura (ID começa com "sub-"), usar um ID numérico grande
    let numericId: number;
    if (backendExpense.id.startsWith('sub-')) {
      // Converter o UUID da assinatura para um número único baseado em hash
      numericId = 100000 + Math.abs(backendExpense.id.split('-')[1]?.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0) || 0);
    } else {
      numericId = parseInt(backendExpense.id, 10) || Date.now();
    }

    return {
      id: numericId,
      description: backendExpense.description,
      category: backendExpense.category,
      amount: backendExpense.amount,
      date: backendExpense.date,
    };
  },

  // Converter expense do frontend para o tipo do backend
  frontendToBackendExpense(frontendExpense: Omit<import('../types').Expense, 'id'>): {
    amount: number;
    description: string;
    category: string;
    date: string;
  } {
    return {
      amount: frontendExpense.amount,
      description: frontendExpense.description,
      category: frontendExpense.category,
      date: frontendExpense.date,
    };
  },

  // Converter categorias do backend para o frontend
  backendToFrontendCategories(categorySummaries: CategorySummary[]): import('../types').Category[] {
    return categorySummaries.map(summary => ({
      name: summary.category,
      value: summary.totalSpent,
      color: getColorForCategory(summary.category),
    }));
  },

  // Converter assinatura do backend para o tipo do frontend
  backendToFrontendSubscription(backendSubscription: BackendSubscription): import('../types').Subscription {
    return {
      id: parseInt(backendSubscription.id, 10) || Date.now(),
      name: backendSubscription.name,
      category: backendSubscription.category,
      amount: backendSubscription.amount,
      nextPayment: backendSubscription.nextPayment,
      status: backendSubscription.status,
    };
  },

  // Converter assinatura do frontend para o tipo do backend
  frontendToBackendSubscription(frontendSubscription: Omit<import('../types').Subscription, 'id'>): {
    name: string;
    category: string;
    amount: number;
    nextPayment: string;
    status: 'Ativa' | 'Pendente' | 'Cancelada';
  } {
    return {
      name: frontendSubscription.name,
      category: frontendSubscription.category,
      amount: frontendSubscription.amount,
      nextPayment: frontendSubscription.nextPayment,
      status: frontendSubscription.status,
    };
  },

  // Obter mês atual no formato YYYY-MM
  getCurrentMonthString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
};

// Função auxiliar para obter cores das categorias
function getColorForCategory(categoryName: string): string {
  const colorMap: Record<string, string> = {
    'Alimentação': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Casa': '#45B7D1',
    'Saúde': '#96CEB4',
    'Entretenimento': '#FFEAA7',
    'Vestuário': '#DDA0DD',
    'Educação': '#98D8C8',
    'Outros': '#F7DC6F',
  };

  return colorMap[categoryName] || '#95A5A6';
}
