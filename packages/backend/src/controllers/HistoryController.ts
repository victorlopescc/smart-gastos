import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { ApiResponse } from '../types';

export class HistoryController {
  // Obter histórico de gastos com filtros
  static async getExpenseHistory(req: Request, res: Response): Promise<void> {
    try {
      const {
        startDate,
        endDate,
        category,
        search,
        page = '1',
        limit = '50'
      } = req.query as Record<string, string>;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      // Obter todas as despesas
      let allExpenses = dataStore.getAllExpenses();

      // Obter todas as assinaturas como despesas históricas
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

      // Aplicar filtros
      let filteredExpenses = allExpenses;

      // Filtro por data
      if (startDate) {
        filteredExpenses = filteredExpenses.filter(expense =>
          expense.date >= startDate
        );
      }

      if (endDate) {
        filteredExpenses = filteredExpenses.filter(expense =>
          expense.date <= endDate
        );
      }

      // Filtro por categoria
      if (category && category !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense =>
          expense.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Filtro por busca (descrição)
      if (search) {
        filteredExpenses = filteredExpenses.filter(expense =>
          expense.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Ordenar por data (mais recente primeiro)
      filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Paginação
      const total = filteredExpenses.length;
      const paginatedExpenses = filteredExpenses.slice(offset, offset + limitNum);

      const response: ApiResponse<{
        expenses: typeof paginatedExpenses;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }> = {
        success: true,
        data: {
          expenses: paginatedExpenses,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar histórico de gastos'
      };
      res.status(500).json(response);
    }
  }

  // Obter estatísticas do histórico
  static async getHistoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;

      let allExpenses = dataStore.getAllExpenses();

      // Obter assinaturas como despesas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Aplicar filtros de data
      if (startDate) {
        allExpenses = allExpenses.filter(expense => expense.date >= startDate);
      }

      if (endDate) {
        allExpenses = allExpenses.filter(expense => expense.date <= endDate);
      }

      // Calcular estatísticas
      const totalExpenses = allExpenses.length;
      const totalAmount = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

      // Agrupar por categoria
      const categoryStats = new Map<string, { total: number; count: number }>();
      allExpenses.forEach(expense => {
        const current = categoryStats.get(expense.category) || { total: 0, count: 0 };
        categoryStats.set(expense.category, {
          total: current.total + expense.amount,
          count: current.count + 1
        });
      });

      const categorySummary = Array.from(categoryStats.entries()).map(([category, data]) => ({
        category,
        totalAmount: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
      })).sort((a, b) => b.totalAmount - a.totalAmount);

      // Agrupar por mês
      const monthlyStats = new Map<string, number>();
      allExpenses.forEach(expense => {
        const month = expense.date.substring(0, 7); // YYYY-MM
        const current = monthlyStats.get(month) || 0;
        monthlyStats.set(month, current + expense.amount);
      });

      const monthlyData = Array.from(monthlyStats.entries()).map(([month, amount]) => ({
        month,
        amount
      })).sort((a, b) => a.month.localeCompare(b.month));

      const response: ApiResponse<{
        totalExpenses: number;
        totalAmount: number;
        averageAmount: number;
        categorySummary: typeof categorySummary;
        monthlyData: typeof monthlyData;
      }> = {
        success: true,
        data: {
          totalExpenses,
          totalAmount,
          averageAmount,
          categorySummary,
          monthlyData
        }
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar estatísticas do histórico'
      };
      res.status(500).json(response);
    }
  }

  // Obter gastos por período (para gráficos)
  static async getExpensesByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'month', startDate, endDate } = req.query as Record<string, string>;

      let allExpenses = dataStore.getAllExpenses();

      // Incluir assinaturas
      const subscriptions = dataStore.getAllSubscriptions();
      const subscriptionExpenses = subscriptions.map(subscription => ({
        id: `sub-${subscription.id}`,
        description: `Assinatura ${subscription.name}`,
        category: subscription.category,
        amount: subscription.amount,
        date: subscription.nextPayment
      }));

      allExpenses = [...allExpenses, ...subscriptionExpenses];

      // Aplicar filtros de data
      if (startDate) {
        allExpenses = allExpenses.filter(expense => expense.date >= startDate);
      }

      if (endDate) {
        allExpenses = allExpenses.filter(expense => expense.date <= endDate);
      }

      // Agrupar por período
      const periodStats = new Map<string, number>();

      allExpenses.forEach(expense => {
        let periodKey: string;

        if (period === 'day') {
          periodKey = expense.date; // YYYY-MM-DD
        } else if (period === 'week') {
          const date = new Date(expense.date);
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          periodKey = startOfWeek.toISOString().substring(0, 10);
        } else if (period === 'month') {
          periodKey = expense.date.substring(0, 7); // YYYY-MM
        } else { // year
          periodKey = expense.date.substring(0, 4); // YYYY
        }

        const current = periodStats.get(periodKey) || 0;
        periodStats.set(periodKey, current + expense.amount);
      });

      const periodData = Array.from(periodStats.entries()).map(([period, amount]) => ({
        period,
        amount
      })).sort((a, b) => a.period.localeCompare(b.period));

      const response: ApiResponse<typeof periodData> = {
        success: true,
        data: periodData
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar gastos por período'
      };
      res.status(500).json(response);
    }
  }
}
