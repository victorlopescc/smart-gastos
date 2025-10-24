# 💰 Smart Gastos - Sistema de Gestão Financeira

Um sistema completo de gestão financeira pessoal desenvolvido com React, TypeScript e Mantine UI. O projeto oferece uma interface moderna e intuitiva para controle de gastos, assinaturas, relatórios e muito mais.

## 🚀 Tecnologias Utilizadas

### **Frontend Core**
- **React 19** - Biblioteca principal para construção da interface
- **TypeScript 5.8** - Tipagem estática para maior segurança e produtividade
- **Vite 7.1** - Build tool moderna e rápida para desenvolvimento

### **UI Framework & Componentes**
- **Mantine UI 8.3** - Framework de componentes moderno e acessível
- **@mantine/form** - Gerenciamento e validação de formulários
- **@mantine/hooks** - Hooks utilitários para funcionalidades comuns
- **@mantine/notifications** - Sistema de notificações toast
- **@tabler/icons-react** - Biblioteca de ícones SVG

### **Visualização de Dados**
- **Recharts 3.2** - Biblioteca para gráficos e dashboards interativos

### **Utilitários**
- **jsPDF 3.0** - Geração de relatórios em PDF
- **@emotion/react** - CSS-in-JS para estilização

### **Desenvolvimento**
- **ESLint** - Linting e padronização de código
- **TypeScript ESLint** - Regras específicas para TypeScript

## 📋 Funcionalidades Principais

### 🔐 **Sistema de Autenticação**
- **Login e Cadastro** com validação em tempo real
- **Persistência de sessão** usando localStorage
- **Validação de formulários** com feedback visual
- **Conta de demonstração** pré-configurada
- **Gerenciamento de erros** com mensagens claras

### 👤 **Perfil do Usuário**
- **Edição de informações pessoais** (nome, email)
- **Upload de foto de perfil** com preview
- **Alteração de senha** com validação de segurança
- **Preferências do usuário** (moeda, notificações)
- **Modo escuro/claro** personalizável

### 📊 **Dashboard Interativo**
- **Resumo financeiro** em tempo real
- **Gráficos de categorias** de gastos
- **Indicadores visuais** de orçamento vs gastos
- **Despesas recentes** com detalhamento
- **Cards informativos** com estatísticas importantes

### 💳 **Gerenciamento de Assinaturas**
- **Cadastro de assinaturas** recorrentes
- **Monitoramento de pagamentos** mensais
- **Alertas de vencimento** automáticos
- **Categorização** por tipo de serviço
- **Projeções anuais** de gastos

### 📈 **Relatórios e Análises**
- **Relatórios mensais** detalhados
- **Gráficos de tendências** temporais
- **Análise por categorias** de gastos
- **Exportação para PDF** dos relatórios
- **Comparativos** entre períodos

### 🔔 **Sistema de Alertas**
- **Notificações em tempo real** sobre limites
- **Alertas de orçamento** quando próximo do limite
- **Lembretes de pagamento** de assinaturas
- **Configurações personalizáveis** de notificações

### 📜 **Histórico de Despesas**
- **Listagem completa** de todas as transações
- **Filtros avançados** por período, categoria, valor
- **Busca textual** nas descrições
- **Paginação** para grandes volumes de dados
- **Ações em massa** para múltiplas despesas

## 🏗️ Arquitetura do Sistema

### **Context API + Hooks Personalizados**
O sistema utiliza uma arquitetura baseada em Context API do React para gerenciamento de estado global:

- **AuthContext** - Autenticação e dados do usuário
- **ThemeContext** - Tema claro/escuro
- **DashboardContext** - Dados do painel principal
- **SubscriptionsContext** - Gerenciamento de assinaturas
- **AlertsContext** - Sistema de notificações
- **ReportsContext** - Relatórios e análises

### **Hooks Personalizados**
- `useAuth()` - Autenticação e perfil
- `useTheme()` - Controle de tema
- `useDashboard()` - Dados do dashboard
- `useSubscriptions()` - Assinaturas
- `useAlerts()` - Alertas e notificações
- `useReports()` - Relatórios

### **Estrutura de Componentes**
```
src/
├── components/
│   ├── auth/           # Telas de login e cadastro
│   ├── dashboard/      # Componentes do painel
│   ├── layout/         # Layout e navegação
│   └── pages/          # Páginas principais
├── contexts/           # Contextos React
├── hooks/             # Hooks personalizados
├── types/             # Definições TypeScript
├── data/              # Dados mockados
└── utils/             # Utilitários e formatadores
```

## 💾 Persistência de Dados

O sistema utiliza **localStorage** para simular um banco de dados local, permitindo:
- Persistência entre sessões
- Múltiplas contas de usuário
- Dados de demonstração pré-carregados
- Sincronização automática

## 🎨 Design System

### **Tema Personalizável**
- **Modo claro/escuro** com transições suaves
- **Cores consistentes** em todo o sistema
- **Tipografia** otimizada para legibilidade
- **Espaçamentos** padronizados

### **Responsividade**
- **Design mobile-first** para todos os dispositivos
- **Grid system** flexível do Mantine
- **Breakpoints** otimizados para diferentes telas

## 🧪 Conta de Demonstração

Para testar o sistema, use a conta pré-configurada:
- **Email:** `teste@exemplo.com`
- **Senha:** `123456`

## 📱 Funcionalidades por Tela

### **🏠 Dashboard**
- Resumo financeiro do mês atual
- Gráfico de pizza das categorias
- Lista das últimas despesas
- Indicadores de progresso do orçamento

### **💳 Assinaturas**
- Lista de todas as assinaturas ativas
- Botões para adicionar/editar/cancelar
- Próximos vencimentos destacados
- Total mensal de assinaturas

### **🔔 Alertas**
- Central de notificações
- Filtros por tipo de alerta
- Histórico de alertas antigos
- Configurações de preferências

### **📊 Relatórios**
- Gráficos de tendências mensais
- Análise de gastos por categoria
- Comparativos entre períodos
- Exportação para PDF

### **📜 Histórico**
- Lista paginada de todas as despesas
- Filtros por data, categoria e valor
- Busca por descrição
- Ações de edição e exclusão

### **👤 Perfil**
- Edição de dados pessoais
- Upload de foto de perfil
- Alteração de senha
- Configurações de preferências

## 📄 Licença

Este projeto é um sistema de demonstração desenvolvido para fins educacionais e de portfólio.

---

**Desenvolvido com ❤️ usando React + TypeScript + Mantine UI**
