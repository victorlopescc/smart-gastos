import { Router } from 'express';
import { HistoryController } from '../controllers/HistoryController';

const router = Router();

// Rota para obter histórico de gastos com filtros e paginação
router.get('/history/expenses', HistoryController.getExpenseHistory);

// Rota para obter estatísticas do histórico
router.get('/history/stats', HistoryController.getHistoryStats);

// Rota para obter gastos por período (para gráficos)
router.get('/history/period', HistoryController.getExpensesByPeriod);

export default router;
