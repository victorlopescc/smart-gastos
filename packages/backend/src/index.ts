import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dashboardRoutes from './routes/dashboard';
import subscriptionsRoutes from './routes/subscriptions';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { seedData } from './utils/seedData';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', dashboardRoutes);
app.use('/api', subscriptionsRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Gastos API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
  console.log(`🏥 Health check em http://localhost:${PORT}/health`);

  // Popular dados iniciais em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    seedData();
  }
});

export default app;
