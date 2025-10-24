import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { converters } from '../services/apiService';
import type { Expense } from '../types';

interface ReportsSummary {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
}

interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyStats {
  month: string;
  amount: number;
  count: number;
}

interface PeriodComparison {
  period1: {
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categoryBreakdown: Record<string, number>;
    startDate: string;
    endDate: string;
  };
  period2: {
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categoryBreakdown: Record<string, number>;
    startDate: string;
    endDate: string;
  };
  comparison: {
    totalAmountChange: number;
    totalExpensesChange: number;
    amountDifference: number;
    expensesDifference: number;
  };
}

interface TrendsData {
  trends: Array<{
    month: string;
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    categories: Record<string, number>;
  }>;
  trendDirection: 'crescente' | 'decrescente' | 'estável';
  averageMonthlySpending: number;
  monthsAnalyzed: number;
}

interface CategoryReport {
  category: string;
  summary: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    startDate: string;
    endDate: string;
  };
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  expenses: Expense[];
}

export function useReportsApi() {
  const [reportsData, setReportsData] = useState<{
    summary: ReportsSummary;
    categorySummary: CategorySummary[];
    monthlyStats: MonthlyStats[];
    topCategories: CategorySummary[];
    recentExpenses: Expense[];
  } | null>(null);

  const [periodComparison, setPeriodComparison] = useState<PeriodComparison | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [categoryReport, setCategoryReport] = useState<CategoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados gerais de relatórios
  const loadReportsData = useCallback(async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getReportsData(params);

      if (response.success && response.data) {
        // Converter despesas do backend para o frontend
        const convertedRecentExpenses = response.data.recentExpenses.map(expense =>
          converters.backendToFrontendExpense(expense)
        );

        setReportsData({
          summary: response.data.summary,
          categorySummary: response.data.categorySummary,
          monthlyStats: response.data.monthlyStats,
          topCategories: response.data.topCategories,
          recentExpenses: convertedRecentExpenses
        });
      } else {
        setError(response.error || 'Erro ao carregar dados de relatórios');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar comparação entre períodos
  const loadPeriodComparison = useCallback(async (params: {
    period1Start: string;
    period1End: string;
    period2Start: string;
    period2End: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getPeriodComparison(params);

      if (response.success && response.data) {
        setPeriodComparison(response.data);
      } else {
        setError(response.error || 'Erro ao carregar comparação de períodos');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar comparação:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar análise de tendências
  const loadTrends = useCallback(async (params?: { months?: number }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getTrends(params);

      if (response.success && response.data) {
        setTrendsData(response.data);
      } else {
        setError(response.error || 'Erro ao carregar tendências');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar tendências:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar relatório por categoria
  const loadCategoryReport = useCallback(async (params: {
    category: string;
    startDate?: string;
    endDate?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCategoryReport(params);

      if (response.success && response.data) {
        // Converter despesas do backend para o frontend
        const convertedExpenses = response.data.expenses.map(expense =>
          converters.backendToFrontendExpense(expense)
        );

        setCategoryReport({
          ...response.data,
          expenses: convertedExpenses
        });
      } else {
        setError(response.error || 'Erro ao carregar relatório de categoria');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro ao carregar relatório de categoria:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadReportsData();
    loadTrends({ months: 6 });
  }, [loadReportsData, loadTrends]);

  return {
    // Estado
    reportsData,
    periodComparison,
    trendsData,
    categoryReport,
    loading,
    error,

    // Ações
    loadReportsData,
    loadPeriodComparison,
    loadTrends,
    loadCategoryReport,
  };
}
