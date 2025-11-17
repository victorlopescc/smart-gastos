import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();

// Rota para obter todos os dados do dashboard
router.get('/dashboard', DashboardController.getDashboardData);

// Rota para definir/atualizar orçamento
router.post('/budget', DashboardController.setBudget);

// Rota para adicionar despesa
router.post('/expenses', DashboardController.addExpense);

// Rota para obter resumo por categoria
router.get('/categories/summary', DashboardController.getCategorySummary);

// Rota para obter despesas recentes
router.get('/expenses/recent', DashboardController.getRecentExpenses);

// Rota para deletar despesa
router.delete('/expenses/:id', DashboardController.deleteExpense);

export default router;
