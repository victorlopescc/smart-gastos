import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { DashboardData, ApiResponse } from '../types';

export class DashboardController {
  // Obter dados completos do dashboard
  static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string || new Date().toISOString().substring(0, 7);

      const budget = dataStore.getBudgetByMonth(month);
      const monthExpenses = dataStore.getExpensesByMonth(month);
      const subscriptionExpenses = dataStore.getSubscriptionExpenses(month);

      // Combinar despesas regulares com assinaturas
      const allExpenses = [...monthExpenses, ...subscriptionExpenses];
      const totalSpent = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget ? budget.totalBudget - totalSpent : 0;

      // getCategorySummary já inclui as assinaturas automaticamente
      const categoryChart = dataStore.getCategorySummary(month);

      // Despesas recentes incluindo assinaturas (TODAS do mês)
      const allRecentExpenses = allExpenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const dashboardData: DashboardData = {
        budget,
        totalSpent,
        remaining,
        expenses: allExpenses,
        categoryChart,
        recentExpenses: allRecentExpenses
      };

      const response: ApiResponse<DashboardData> = {
        success: true,
        data: dashboardData
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar dados do dashboard'
      };
      res.status(500).json(response);
    }
  }

  // Definir ou atualizar orçamento do mês
  static async setBudget(req: Request, res: Response): Promise<void> {
    try {
      const { month, totalBudget } = req.body;

      if (!month || typeof totalBudget !== 'number' || totalBudget <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Mês e orçamento total são obrigatórios. Orçamento deve ser maior que zero.'
        };
        res.status(400).json(response);
        return;
      }

      const budget = dataStore.setBudget({ month, totalBudget });

      const response: ApiResponse<typeof budget> = {
        success: true,
        data: budget,
        message: 'Orçamento definido com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao definir orçamento'
      };
      res.status(500).json(response);
    }
  }

  // Adicionar nova despesa
  static async addExpense(req: Request, res: Response): Promise<void> {
    try {
      const { amount, description, category, date } = req.body;

      if (!amount || !description || !category || !date) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Todos os campos são obrigatórios: amount, description, category, date'
        };
        res.status(400).json(response);
        return;
      }

      if (typeof amount !== 'number' || amount <= 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Valor deve ser um número maior que zero'
        };
        res.status(400).json(response);
        return;
      }

      const expense = dataStore.addExpense({
        amount,
        description,
        category,
        date
      });

      const response: ApiResponse<typeof expense> = {
        success: true,
        data: expense,
        message: 'Despesa adicionada com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao adicionar despesa'
      };
      res.status(500).json(response);
    }
  }

  // Obter resumo por categoria
  static async getCategorySummary(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string || new Date().toISOString().substring(0, 7);
      const categorySummary = dataStore.getCategorySummary(month);

      const response: ApiResponse<typeof categorySummary> = {
        success: true,
        data: categorySummary
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar resumo por categoria'
      };
      res.status(500).json(response);
    }
  }

  // Obter despesas recentes
  static async getRecentExpenses(req: Request, res: Response): Promise<void> {
    try {
      const month = req.query.month as string || new Date().toISOString().substring(0, 7);
      const recentExpenses = dataStore.getRecentExpenses(month);

      const response: ApiResponse<typeof recentExpenses> = {
        success: true,
        data: recentExpenses
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar despesas recentes'
      };
      res.status(500).json(response);
    }
  }

  // Deletar despesa
  static async deleteExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'ID da despesa é obrigatório'
        };
        res.status(400).json(response);
        return;
      }

      const deleted = dataStore.deleteExpense(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Despesa não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Despesa deletada com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao deletar despesa'
      };
      res.status(500).json(response);
    }
  }
}
