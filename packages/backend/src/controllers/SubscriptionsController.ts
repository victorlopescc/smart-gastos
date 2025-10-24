import { Request, Response } from 'express';
import { dataStore } from '../models/DataStore';
import { ApiResponse, Subscription } from '../types';

export class SubscriptionsController {
  // Obter todas as assinaturas
  static async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = dataStore.getAllSubscriptions();

      const response: ApiResponse<Subscription[]> = {
        success: true,
        data: subscriptions
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar assinaturas'
      };
      res.status(500).json(response);
    }
  }

  // Obter assinatura por ID
  static async getSubscriptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const subscription = dataStore.getSubscriptionById(id);

      if (!subscription) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Assinatura não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Subscription> = {
        success: true,
        data: subscription
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar assinatura'
      };
      res.status(500).json(response);
    }
  }

  // Adicionar nova assinatura
  static async addSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { name, category, amount, nextPayment, status } = req.body;

      if (!name || !category || !amount || !nextPayment) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Todos os campos são obrigatórios: name, category, amount, nextPayment'
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

      const validStatuses = ['Ativa', 'Pendente', 'Cancelada'];
      if (status && !validStatuses.includes(status)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Status deve ser: Ativa, Pendente ou Cancelada'
        };
        res.status(400).json(response);
        return;
      }

      const subscription = dataStore.addSubscription({
        name,
        category,
        amount,
        nextPayment,
        status: status || 'Ativa'
      });

      const response: ApiResponse<Subscription> = {
        success: true,
        data: subscription,
        message: 'Assinatura adicionada com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao adicionar assinatura'
      };
      res.status(500).json(response);
    }
  }

  // Atualizar assinatura
  static async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, category, amount, nextPayment, status } = req.body;

      if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Valor deve ser um número maior que zero'
        };
        res.status(400).json(response);
        return;
      }

      const validStatuses = ['Ativa', 'Pendente', 'Cancelada'];
      if (status && !validStatuses.includes(status)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Status deve ser: Ativa, Pendente ou Cancelada'
        };
        res.status(400).json(response);
        return;
      }

      const updatedSubscription = dataStore.updateSubscription(id, {
        name,
        category,
        amount,
        nextPayment,
        status
      });

      if (!updatedSubscription) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Assinatura não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Subscription> = {
        success: true,
        data: updatedSubscription,
        message: 'Assinatura atualizada com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao atualizar assinatura'
      };
      res.status(500).json(response);
    }
  }

  // Deletar assinatura
  static async deleteSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = dataStore.deleteSubscription(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Assinatura não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Assinatura deletada com sucesso'
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao deletar assinatura'
      };
      res.status(500).json(response);
    }
  }

  // Obter apenas assinaturas ativas
  static async getActiveSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const activeSubscriptions = dataStore.getActiveSubscriptions();

      const response: ApiResponse<Subscription[]> = {
        success: true,
        data: activeSubscriptions
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao buscar assinaturas ativas'
      };
      res.status(500).json(response);
    }
  }

  // Obter total gasto em assinaturas ativas
  static async getTotalSubscriptionCost(req: Request, res: Response): Promise<void> {
    try {
      const totalCost = dataStore.getTotalSubscriptionCost();

      const response: ApiResponse<{ totalCost: number }> = {
        success: true,
        data: { totalCost }
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Erro ao calcular total de assinaturas'
      };
      res.status(500).json(response);
    }
  }
}
