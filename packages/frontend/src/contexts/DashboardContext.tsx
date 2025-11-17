import { createContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { MonthlyData, Expense, Category, Subscription } from '../types'
import { apiService, converters } from '../services/apiService'

interface DashboardContextType {
  monthlyData: MonthlyData
  addedExpenses: Expense[]
  updateBudget: (newBudget: number) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  editExpense: (id: number, expense: Omit<Expense, 'id'>) => void
  deleteExpense: (id: number) => void
  getCurrentMonth: () => string
  // Novas funções para integração com assinaturas (sem alterar visual)
  getSubscriptionExpenses: () => Expense[]
  getTotalSubscriptionCost: () => number
  setSubscriptions: (subscriptions: Subscription[]) => void
  // Integração com alertas
  setAlertHandlers: (handlers: {
    processBudgetAlerts: (monthlyData: MonthlyData) => void
    processExpenseAlerts: (expenses: Expense[], monthlyData: MonthlyData) => void
  }) => void
  // Estados de carregamento
  isLoading: boolean
  error: string | null
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Estados de controle
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Handlers para alertas (integração invisível)
  const [alertHandlers, setAlertHandlers] = useState<{
    processBudgetAlerts?: (monthlyData: MonthlyData) => void
    processExpenseAlerts?: (expenses: Expense[], monthlyData: MonthlyData) => void
  }>({})

  // Estado separado para os gastos adicionados pelo usuário (mantido para compatibilidade)
  const [addedExpenses, setAddedExpenses] = useState<Expense[]>([])

  // Estado principal dos dados do dashboard
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    budget: 0,
    spent: 0,
    categories: [],
    recentExpenses: []
  })

  const getCurrentMonth = () => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  // Função para carregar dados do backend
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const currentMonth = converters.getCurrentMonthString()
      const response = await apiService.getDashboardData(currentMonth)

      if (response.success && response.data) {
        const data = response.data

        // Converter dados do backend para o formato do frontend
        const frontendExpenses = data.expenses.map(converters.backendToFrontendExpense)
        const frontendCategories = converters.backendToFrontendCategories(data.categoryChart)
        const frontendRecentExpenses = data.recentExpenses.map(converters.backendToFrontendExpense)

        setMonthlyData({
          budget: data.budget?.totalBudget || 0,
          spent: data.totalSpent,
          categories: frontendCategories,
          recentExpenses: frontendRecentExpenses
        })

        // Limpar addedExpenses pois agora usamos o backend
        setAddedExpenses([])
      } else {
        setError(response.error || 'Erro ao carregar dados do dashboard')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar dados quando o componente monta
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Atualizar orçamento
  const updateBudget = useCallback(async (newBudget: number) => {
    if (newBudget <= 0) return

    try {
      setIsLoading(true)
      const currentMonth = converters.getCurrentMonthString()
      const response = await apiService.setBudget(currentMonth, newBudget)

      if (response.success) {
        // Recarregar dados do dashboard
        await loadDashboardData()
      } else {
        setError(response.error || 'Erro ao atualizar orçamento')
      }
    } catch (err) {
      setError('Erro de conexão ao atualizar orçamento')
      console.error('Erro ao atualizar orçamento:', err)
    }
  }, [loadDashboardData])

  // Função para carregar assinaturas do backend e converter para despesas (compatibilidade)
  const getSubscriptionExpenses = useCallback(async (): Promise<Expense[]> => {
    try {
      const response = await apiService.getActiveSubscriptions()
      if (response.success && response.data) {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        return response.data.map(sub => ({
          id: parseInt(sub.id, 10) + 100000, // ID único para evitar conflitos
          description: `Assinatura ${sub.name}`,
          category: sub.category,
          amount: sub.amount,
          date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
        }))
      }
    } catch (err) {
      console.error('Erro ao carregar assinaturas:', err)
    }
    return []
  }, [])

  // Função para obter custo total das assinaturas (compatibilidade)
  const getTotalSubscriptionCost = useCallback(async (): Promise<number> => {
    try {
      const response = await apiService.getTotalSubscriptionCost()
      if (response.success && response.data) {
        return response.data.totalCost
      }
    } catch (err) {
      console.error('Erro ao calcular total de assinaturas:', err)
    }
    return 0
  }, [])

  // Função setSubscriptions para compatibilidade (agora apenas um stub)
  const setSubscriptions = useCallback((subscriptions: Subscription[]) => {
    // Esta função agora é apenas para compatibilidade
    // As assinaturas são gerenciadas pelo SubscriptionsContext
  }, [])

  // Adicionar despesa
  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    if (!expenseData || !expenseData.description || !expenseData.category || !expenseData.amount) {
      return
    }

    try {
      setIsLoading(true)
      const backendExpense = converters.frontendToBackendExpense(expenseData)
      const response = await apiService.addExpense(backendExpense)

      if (response.success) {
        // Recarregar dados do dashboard
        await loadDashboardData()
      } else {
        setError(response.error || 'Erro ao adicionar despesa')
      }
    } catch (err) {
      setError('Erro de conexão ao adicionar despesa')
      console.error('Erro ao adicionar despesa:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadDashboardData])

  // Editar despesa (mantida para compatibilidade, mas avisa que não está implementada no backend)
  const editExpense = useCallback((id: number, expenseData: Omit<Expense, 'id'>) => {
    console.warn('Edição de despesas ainda não implementada no backend')
    // TODO: Implementar no backend
  }, [])

  // Deletar despesa
  const deleteExpense = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      const response = await apiService.deleteExpense(id.toString())

      if (response.success) {
        // Recarregar dados do dashboard
        await loadDashboardData()
      } else {
        setError(response.error || 'Erro ao deletar despesa')
      }
    } catch (err) {
      setError('Erro de conexão ao deletar despesa')
      console.error('Erro ao deletar despesa:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadDashboardData])

  const setAlertHandlersFunc = useCallback((handlers: {
    processBudgetAlerts: (monthlyData: MonthlyData) => void
    processExpenseAlerts: (expenses: Expense[], monthlyData: MonthlyData) => void
  }) => {
    setAlertHandlers(handlers)
  }, [])

  // Processar alertas quando os dados mudam
  useEffect(() => {
    if (!isLoading && alertHandlers.processBudgetAlerts) {
      alertHandlers.processBudgetAlerts(monthlyData)
    }
  }, [monthlyData, isLoading, alertHandlers])

  return (
    <DashboardContext.Provider
      value={{
        monthlyData,
        addedExpenses,
        updateBudget,
        addExpense,
        editExpense,
        deleteExpense,
        getCurrentMonth,
        getSubscriptionExpenses,
        getTotalSubscriptionCost,
        setSubscriptions,
        setAlertHandlers: setAlertHandlersFunc,
        isLoading,
        error
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
