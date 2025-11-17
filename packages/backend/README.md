# Smart Gastos - Backend API

Backend em Node.js + Express + TypeScript para o sistema de controle de gastos.

## 🚀 Como executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📋 APIs Disponíveis

### Dashboard
- **GET** `/api/dashboard?month=YYYY-MM` - Obter dados completos do dashboard (inclui assinaturas)
- **GET** `/api/categories/summary?month=YYYY-MM` - Resumo por categoria (inclui assinaturas)
- **GET** `/api/expenses/recent?month=YYYY-MM` - Despesas recentes

### Orçamento
- **POST** `/api/budget` - Definir/atualizar orçamento
  ```json
  {
    "month": "2024-10",
    "totalBudget": 3000
  }
  ```

### Despesas
- **POST** `/api/expenses` - Adicionar nova despesa
  ```json
  {
    "amount": 150.50,
    "description": "Supermercado",
    "category": "Alimentação",
    "date": "2024-10-24"
  }
  ```
- **DELETE** `/api/expenses/:id` - Deletar despesa

### Assinaturas ✨ NOVO
- **GET** `/api/subscriptions` - Obter todas as assinaturas
- **GET** `/api/subscriptions/active` - Obter apenas assinaturas ativas
- **GET** `/api/subscriptions/total-cost` - Obter custo total das assinaturas ativas
- **GET** `/api/subscriptions/:id` - Obter assinatura por ID
- **POST** `/api/subscriptions` - Adicionar nova assinatura
  ```json
  {
    "name": "Netflix",
    "category": "Entretenimento",
    "amount": 29.90,
    "nextPayment": "2024-11-15",
    "status": "Ativa"
  }
  ```
- **PUT** `/api/subscriptions/:id` - Atualizar assinatura
- **DELETE** `/api/subscriptions/:id` - Deletar assinatura

### Saúde
- **GET** `/health` - Verificar se a API está funcionando

## 🔧 Estrutura do Projeto

```
src/
├── controllers/     # Lógica de negócio
│   ├── DashboardController.ts
│   └── SubscriptionsController.ts ✨
├── models/         # Modelos de dados (em memória)
│   └── DataStore.ts (com assinaturas) ✨
├── routes/         # Definição das rotas
│   ├── dashboard.ts
│   └── subscriptions.ts ✨
├── middleware/     # Middlewares personalizados
├── types/          # Definições de tipos TypeScript
├── utils/          # Utilitários e helpers
└── index.ts        # Arquivo principal do servidor
```

## 📊 Funcionalidades Implementadas

✅ **Dashboard completo**
- Orçamento mensal configurável
- Soma total de gastos do mês (inclui assinaturas) ✨
- Cálculo do valor restante (considera assinaturas) ✨
- Gráfico de gastos por categoria (inclui assinaturas) ✨
- Tabela de resumo por categoria (inclui assinaturas) ✨
- Lista de gastos recentes (inclui assinaturas do mês) ✨

✅ **Gestão de Despesas**
- Adicionar nova despesa
- Deletar despesa existente
- Categorização automática

✅ **Sistema de Orçamento**
- Definir orçamento mensal
- Atualizar orçamento existente
- Cálculo automático de valores restantes

✅ **Gestão de Assinaturas** ✨ NOVO
- CRUD completo de assinaturas
- Status: Ativa, Pendente, Cancelada
- Integração automática no dashboard
- Conversão para despesas mensais
- Cálculo de custos totais

## 🌱 Dados Iniciais

Em modo de desenvolvimento, o sistema carrega automaticamente:
- Orçamento de R$ 3.000 para o mês atual
- 7 despesas de exemplo em diferentes categorias
- 6 assinaturas de exemplo (Netflix, Spotify, Adobe, etc.) ✨
- Dados prontos para teste das funcionalidades

## 🔄 Integração Frontend

As assinaturas são automaticamente:
- Incluídas nos cálculos do dashboard
- Mostradas como despesas mensais
- Consideradas no orçamento total
- Incluídas nos gráficos de categoria

## 🎯 Próximos Passos

- [ ] Integração com banco de dados
- [ ] Sistema de autenticação
- [ ] Relatórios avançados
- [ ] Notificações de limite de orçamento
- [ ] Alertas de vencimento de assinaturas ✨
