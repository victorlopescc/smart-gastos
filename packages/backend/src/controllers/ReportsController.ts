import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { ApiResponse } from '../types';

export class ReportsController {
  // Obter dados gerais de relatórios
  static async getReportsData(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month', startDate, endDate } = req.query as Record<string, string>;

      // Obter todas as despesas
      let allExpenses = dataStore.getAllExpenses();

      // Obter todas as assinaturas como despesas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      // Combinar despesas e assinaturas
      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Aplicar filtros de data se fornecidos
      if (startDate) {
        allExpenses = allExpenses.filter(expense => expense.date >= startDate);
      }
      if (endDate) {
        allExpenses = allExpenses.filter(expense => expense.date <= endDate);
      }

      // Calcular estatísticas básicas
      const totalExpenses = allExpenses.length;
      const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

      // Agrupar por categoria
      const categoryData = allExpenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { count: 0, amount: 0 };
        }
        acc[expense.category].count++;
        acc[expense.category].amount += expense.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      const categorySummary = Object.entries(categoryData).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
      }));

      // Agrupar por período (mensal)
      const monthlyData = allExpenses.reduce((acc, expense) => {
        const monthKey = expense.date.substring(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, amount: 0 };
        }
        acc[monthKey].count++;
        acc[monthKey].amount += expense.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      const monthlyStats = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const response: ApiResponse<any> = {
        success: true,
        data: {
          summary: {
            totalExpenses,
            totalAmount,
            averageAmount
          },
          categorySummary,
          monthlyStats,
          topCategories: categorySummary
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5),
          recentExpenses: allExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao obter dados de relatórios:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro interno do servidor'
      };
      res.status(500).json(response);
    }
  }

  // Obter comparação entre períodos
  static async getPeriodComparison(req: Request, res: Response): Promise<void> {
    try {
      const { period1Start, period1End, period2Start, period2End } = req.query as Record<string, string>;

      if (!period1Start || !period1End || !period2Start || !period2End) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Parâmetros de período obrigatórios'
        };
        res.status(400).json(response);
        return;
      }

      // Obter todas as despesas
      let allExpenses = dataStore.getAllExpenses();

      // Obter todas as assinaturas como despesas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Filtrar por períodos
      const period1Expenses = allExpenses.filter(expense =>
        expense.date >= period1Start && expense.date <= period1End
      );

      const period2Expenses = allExpenses.filter(expense =>
        expense.date >= period2Start && expense.date <= period2End
      );

      // Calcular estatísticas para cada período
      const calculatePeriodStats = (expenses: any[]) => ({
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        averageAmount: expenses.length > 0 ? expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length : 0,
        categoryBreakdown: expenses.reduce((acc, expense) => {
          if (!acc[expense.category]) {
            acc[expense.category] = 0;
          }
          acc[expense.category] += expense.amount;
          return acc;
        }, {} as Record<string, number>)
      });

      const period1Stats = calculatePeriodStats(period1Expenses);
      const period2Stats = calculatePeriodStats(period2Expenses);

      // Calcular variações percentuais
      const totalAmountChange = period1Stats.totalAmount > 0
        ? ((period2Stats.totalAmount - period1Stats.totalAmount) / period1Stats.totalAmount) * 100
        : 0;

      const totalExpensesChange = period1Stats.totalExpenses > 0
        ? ((period2Stats.totalExpenses - period1Stats.totalExpenses) / period1Stats.totalExpenses) * 100
        : 0;

      const response: ApiResponse<any> = {
        success: true,
        data: {
          period1: {
            ...period1Stats,
            startDate: period1Start,
            endDate: period1End
          },
          period2: {
            ...period2Stats,
            startDate: period2Start,
            endDate: period2End
          },
          comparison: {
            totalAmountChange,
            totalExpensesChange,
            amountDifference: period2Stats.totalAmount - period1Stats.totalAmount,
            expensesDifference: period2Stats.totalExpenses - period1Stats.totalExpenses
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao comparar períodos:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro interno do servidor'
      };
      res.status(500).json(response);
    }
  }

  // Obter análise de tendências
  static async getTrends(req: Request, res: Response): Promise<void> {
    try {
      const { months = '6' } = req.query as Record<string, string>;
      const monthsCount = parseInt(months, 10);

      // Obter todas as despesas
      let allExpenses = dataStore.getAllExpenses();

      // Obter todas as assinaturas como despesas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Agrupar por mês
      const monthlyData = allExpenses.reduce((acc, expense) => {
        const monthKey = expense.date.substring(0, 7); // YYYY-MM
        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push(expense);
        return acc;
      }, {} as Record<string, any[]>);

      // Calcular tendências dos últimos meses
      const months_list = Object.keys(monthlyData)
        .sort()
        .slice(-monthsCount);

      const trends = months_list.map(month => {
        const monthExpenses = monthlyData[month] || [];
        const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalCount = monthExpenses.length;

        // Calcular por categoria
        const categoryData = monthExpenses.reduce((acc, expense) => {
          if (!acc[expense.category]) {
            acc[expense.category] = 0;
          }
          acc[expense.category] += expense.amount;
          return acc;
        }, {} as Record<string, number>);

        return {
          month,
          totalAmount,
          totalCount,
          averageAmount: totalCount > 0 ? totalAmount / totalCount : 0,
          categories: categoryData
        };
      });

      // Calcular tendência geral (crescimento/decrescimento)
      const trendDirection = trends.length >= 2
        ? trends[trends.length - 1].totalAmount > trends[0].totalAmount ? 'crescente' : 'decrescente'
        : 'estável';

      const response: ApiResponse<any> = {
        success: true,
        data: {
          trends,
          trendDirection,
          averageMonthlySpending: trends.reduce((sum, trend) => sum + trend.totalAmount, 0) / trends.length,
          monthsAnalyzed: monthsCount
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao obter tendências:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro interno do servidor'
      };
      res.status(500).json(response);
    }
  }

  // Obter relatório detalhado por categoria
  static async getCategoryReport(req: Request, res: Response): Promise<void> {
    try {
      const { category, startDate, endDate } = req.query as Record<string, string>;

      if (!category) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Categoria é obrigatória'
        };
        res.status(400).json(response);
        return;
      }

      // Obter todas as despesas
      let allExpenses = dataStore.getAllExpenses();

      // Obter todas as assinaturas como despesas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Filtrar por categoria
      let categoryExpenses = allExpenses.filter(expense => expense.category === category);

      // Aplicar filtros de data se fornecidos
      if (startDate) {
        categoryExpenses = categoryExpenses.filter(expense => expense.date >= startDate);
      }
      if (endDate) {
        categoryExpenses = categoryExpenses.filter(expense => expense.date <= endDate);
      }

      // Calcular estatísticas da categoria
      const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalCount = categoryExpenses.length;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

      // Agrupar por mês
      const monthlyBreakdown = categoryExpenses.reduce((acc, expense) => {
        const monthKey = expense.date.substring(0, 7);
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, amount: 0 };
        }
        acc[monthKey].count++;
        acc[monthKey].amount += expense.amount;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      const monthlyStats = Object.entries(monthlyBreakdown)
        .map(([month, data]) => ({
          month,
          amount: data.amount,
          count: data.count
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const response: ApiResponse<any> = {
        success: true,
        data: {
          category,
          summary: {
            totalAmount,
            totalCount,
            averageAmount,
            startDate: startDate || 'N/A',
            endDate: endDate || 'N/A'
          },
          monthlyStats,
          expenses: categoryExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 50) // Limitar a 50 despesas mais recentes
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Erro ao obter relatório de categoria:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro interno do servidor'
      };
      res.status(500).json(response);
    }
  }
}
