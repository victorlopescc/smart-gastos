import { useState, useEffect, useCallback } from 'react';
import { apiService, type BackendExpense } from '../services/apiService';
import { converters } from '../services/apiService';
import type { Expense } from '../types';

interface HistoryFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface HistoryStats {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  categorySummary: Array<{
    category: string;
    totalAmount: number;
    count: number;
    percentage: number;
  }>;
  monthlyData: Array<{
    month: string;
    amount: number;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useHistory() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [periodData, setPeriodData] = useState<Array<{ period: string; amount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar histórico de despesas
  const loadExpenseHistory = useCallback(async (filters?: HistoryFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getExpenseHistory(filters);

      if (response.success && response.data) {
        // Converter despesas do backend para o frontend
        const convertedExpenses = response.data.expenses.map(expense =>
          converters.backendToFrontendExpense(expense)
        );

        setExpenses(convertedExpenses);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Erro ao carregar histórico');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas do histórico
  const loadHistoryStats = useCallback(async (filters?: { startDate?: string; endDate?: string }) => {
    try {
      const response = await apiService.getHistoryStats(filters);

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Carregar dados por período
  const loadExpensesByPeriod = useCallback(async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await apiService.getExpensesByPeriod(params);

      if (response.success && response.data) {
        setPeriodData(response.data);
      } else {
        setError(response.error || 'Erro ao carregar dados por período');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar dados por período:', err);
    }
  }, []);

  // Buscar despesas com filtros
  const searchExpenses = useCallback(async (filters: HistoryFilters) => {
    await loadExpenseHistory(filters);
  }, [loadExpenseHistory]);

  // Navegar entre páginas
  const goToPage = useCallback(async (page: number, filters?: Omit<HistoryFilters, 'page'>) => {
    await loadExpenseHistory({ ...filters, page });
  }, [loadExpenseHistory]);

  // Obter categorias únicas do histórico
  const getUniqueCategories = useCallback(() => {
    const categories = new Set(expenses.map(expense => expense.category));
    return Array.from(categories).sort();
  }, [expenses]);

  // Carregar dados iniciais
  useEffect(() => {
    loadExpenseHistory();
  }, [loadExpenseHistory]);

  return {
    // Estado
    expenses,
    pagination,
    stats,
    periodData,
    loading,
    error,

    // Ações
    loadExpenseHistory,
    loadHistoryStats,
    loadExpensesByPeriod,
    searchExpenses,
    goToPage,

    // Utilitários
    getUniqueCategories,
  };
}
