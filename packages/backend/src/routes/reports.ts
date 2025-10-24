import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController';

const router = Router();

// Rota para obter dados gerais de relatórios
router.get('/reports/data', ReportsController.getReportsData);

// Rota para comparação entre períodos
router.get('/reports/comparison', ReportsController.getPeriodComparison);

// Rota para análise de tendências
router.get('/reports/trends', ReportsController.getTrends);

// Rota para relatório detalhado por categoria
router.get('/reports/category', ReportsController.getCategoryReport);

export default router;
