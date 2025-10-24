import { dataStore } from '../models/DataStore';

export const seedData = () => {
  console.log('🌱 Populando dados iniciais - CENÁRIO TESTE 3...');

  // Usar ano correto (2025) com timezone de Brasília (UTC-3)
  const currentMonth = '2025-10'; // Outubro 2025
  const currentDate = '2025-10-24'; // 24 de outubro 2025

  // Definir orçamento para o mês atual
  dataStore.setBudget({
    month: currentMonth,
    totalBudget: 3000
  });

  // CENÁRIO TESTE 3: 7 despesas (dados originais)
  const sampleExpenses = [
    {
      amount: 150.50,
      description: 'Supermercado - compras da semana',
      category: 'Alimentação',
      date: currentDate
    },
    {
      amount: 45.00,
      description: 'Gasolina',
      category: 'Transporte',
      date: currentDate
    },
    {
      amount: 89.90,
      description: 'Conta de luz',
      category: 'Casa',
      date: currentDate
    },
    {
      amount: 25.00,
      description: 'Lanche no trabalho',
      category: 'Alimentação',
      date: currentDate
    },
    {
      amount: 120.00,
      description: 'Consulta médica',
      category: 'Saúde',
      date: currentDate
    },
    {
      amount: 200.00,
      description: 'Roupas',
      category: 'Vestuário',
      date: currentDate
    },
    {
      amount: 35.50,
      description: 'Cinema',
      category: 'Entretenimento',
      date: currentDate
    }
  ];

  sampleExpenses.forEach(expense => {
    dataStore.addExpense(expense);
  });

  // CENÁRIO TESTE 3: 6 assinaturas (dados originais)
  const sampleSubscriptions = [
    {
      name: 'Netflix',
      category: 'Entretenimento',
      amount: 29.90,
      nextPayment: '2025-10-06',
      status: 'Ativa' as const
    },
    {
      name: 'Spotify',
      category: 'Entretenimento',
      amount: 19.90,
      nextPayment: '2025-10-09',
      status: 'Ativa' as const
    },
    {
      name: 'Adobe Creative Suite',
      category: 'Educação',
      amount: 89.90,
      nextPayment: '2025-10-12',
      status: 'Ativa' as const
    },
    {
      name: 'Amazon Prime',
      category: 'Entretenimento',
      amount: 14.90,
      nextPayment: '2025-10-15',
      status: 'Ativa' as const
    },
    {
      name: 'Gym Membership',
      category: 'Saúde',
      amount: 79.90,
      nextPayment: '2025-10-18',
      status: 'Ativa' as const
    },
    {
      name: 'iCloud Storage',
      category: 'Outros',
      amount: 9.90,
      nextPayment: '2025-10-21',
      status: 'Ativa' as const
    }
  ];

  sampleSubscriptions.forEach(subscription => {
    dataStore.addSubscription(subscription);
  });

  console.log(`✅ CENÁRIO TESTE 3 carregado para o mês ${currentMonth}`);
  console.log(`💰 Orçamento: R$ 3.000,00`);
  console.log(`📊 ${sampleExpenses.length} despesas de teste`);
  console.log(`🔄 ${sampleSubscriptions.length} assinaturas de teste`);
  console.log(`📋 VALORES ESPERADOS:`);
  console.log(`   - Total de despesas: R$ 665,90`);
  console.log(`   - Total de assinaturas: R$ 244,40`);
  console.log(`   - Total geral: R$ 910,30`);
  console.log(`   - Entretenimento: R$ 100,20 (Cinema + Netflix + Spotify + Amazon)`);
  console.log(`   - Saúde: R$ 199,90 (Consulta + Academia)`);
  console.log(`   - Alimentação: R$ 175,50 (Supermercado + Lanche)`);
  console.log(`   - Vestuário: R$ 200,00 (Roupas)`);
  console.log(`   - Educação: R$ 89,90 (Adobe)`);
  console.log(`   - Casa: R$ 89,90 (Conta de luz)`);
  console.log(`   - Transporte: R$ 45,00 (Gasolina)`);
  console.log(`   - Outros: R$ 9,90 (iCloud)`);
  console.log(`📋 GASTOS RECENTES ESPERADOS: 13 itens (7 despesas + 6 assinaturas)`);
};
