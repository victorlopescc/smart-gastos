import type { MonthlyData } from '../types';

// Dados mock para categorias com cores padronizadas
export const categories = [
  { name: 'Alimentação', value: 850, color: '#FF6B6B' },
  { name: 'Transporte', value: 550, color: '#4ECDC4' },
  { name: 'Moradia', value: 1200, color: '#45B7D1' },
  { name: 'Lazer', value: 350, color: '#96CEB4' },
  { name: 'Saúde', value: 200, color: '#FECA57' },
  { name: 'Educação', value: 400, color: '#FF9FF3' },
  { name: 'Vestuário', value: 300, color: '#54A0FF' },
  { name: 'Outros', value: 150, color: '#5F27CD' }
];

// Dados mock para gastos recentes
export const recentExpenses = [
  { id: 1, description: 'Supermercado Extra', category: 'Alimentação', amount: 127.50, date: '2025-01-09' },
  { id: 2, description: 'Uber para trabalho', category: 'Transporte', amount: 18.50, date: '2025-01-09' },
  { id: 3, description: 'Netflix', category: 'Lazer', amount: 32.90, date: '2025-01-08' },
  { id: 4, description: 'Farmácia Drogasil', category: 'Saúde', amount: 85.20, date: '2025-01-08' },
  { id: 5, description: 'Restaurante Japonês', category: 'Alimentação', amount: 95.00, date: '2025-01-07' },
  { id: 6, description: 'Gasolina Posto Shell', category: 'Transporte', amount: 220.00, date: '2025-01-07' },
  { id: 7, description: 'Academia Smart Fit', category: 'Saúde', amount: 79.90, date: '2025-01-06' },
  { id: 8, description: 'Curso Udemy', category: 'Educação', amount: 149.90, date: '2025-01-06' },
  { id: 9, description: 'Cinema Shopping', category: 'Lazer', amount: 48.00, date: '2025-01-05' },
  { id: 10, description: 'Lanchonete', category: 'Alimentação', amount: 22.80, date: '2025-01-05' }
];

// Dados mock para assinaturas
export const subscriptions = [
  { id: 1, name: 'Netflix', category: 'Entretenimento', amount: 32.90, nextPayment: '2025-02-15', status: 'Ativa' },
  { id: 2, name: 'Spotify', category: 'Entretenimento', amount: 21.90, nextPayment: '2025-02-08', status: 'Ativa' },
  { id: 3, name: 'Amazon Prime', category: 'Entretenimento', amount: 14.90, nextPayment: '2025-02-20', status: 'Ativa' },
  { id: 4, name: 'iCloud', category: 'Tecnologia', amount: 9.90, nextPayment: '2025-02-12', status: 'Ativa' },
  { id: 5, name: 'Adobe Creative', category: 'Trabalho', amount: 85.00, nextPayment: '2025-02-25', status: 'Pendente' }
];

// Dados mock para alertas
export const alerts = [
  { id: 1, type: 'warning', title: 'Orçamento quase esgotado', message: 'Você já gastou 85% do seu orçamento mensal', date: '2025-01-09' },
  { id: 2, type: 'info', title: 'Assinatura vencendo', message: 'Netflix vence em 5 dias', date: '2025-01-08' },
  { id: 3, type: 'success', title: 'Meta atingida', message: 'Parabéns! Você economizou R$ 200 este mês', date: '2025-01-07' },
  { id: 4, type: 'error', title: 'Pagamento em atraso', message: 'Adobe Creative Cloud com pagamento pendente', date: '2025-01-06' }
];

// Dados mock para relatórios mensais
export const monthlyReports = [
  { month: 'Janeiro 2025', budget: 5000, spent: 4200, saved: 800, categories: categories },
  { month: 'Dezembro 2024', budget: 4800, spent: 4650, saved: 150, categories: categories },
  { month: 'Novembro 2024', budget: 4800, spent: 3950, saved: 850, categories: categories },
  { month: 'Outubro 2024', budget: 4500, spent: 4100, saved: 400, categories: categories }
];

// Dados principais da aplicação
export const monthlyData: MonthlyData = {
  budget: 5000,
  spent: 4200,
  categories: categories,
  recentExpenses: recentExpenses.slice(0, 5) // Apenas os 5 mais recentes para o dashboard
};

// Dados do usuário
export const userData = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  avatar: null,
  memberSince: '2024-03-15',
  preferences: {
    currency: 'BRL',
    notifications: true,
    darkMode: false
  }
};
