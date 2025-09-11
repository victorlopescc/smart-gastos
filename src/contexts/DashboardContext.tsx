import { createContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { MonthlyData, Expense, Category, Subscription } from '../types'
import { categories as initialCategories, recentExpenses as initialExpenses } from '../data/mockData'

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
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Estado interno para assinaturas (integração invisível)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  const getCurrentMonth = () => {
    const now = new Date()
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, (c) => c.toUpperCase())
  }

  const getCurrentMonthExpenses = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return initialExpenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth &&
             expenseDate.getFullYear() === currentYear
    })
  }

  // Função para converter assinaturas em gastos mensais
  const getSubscriptionExpenses = useCallback((): Expense[] => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return subscriptions
      .filter(sub => sub.status === 'Ativa')
      .map(sub => ({
        id: sub.id + 100000, // ID único para evitar conflitos
        description: `Assinatura ${sub.name}`,
        category: sub.category,
        amount: sub.amount,
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      }))
  }, [subscriptions])

  // Função para obter custo total das assinaturas
  const getTotalSubscriptionCost = useCallback((): number => {
    return subscriptions
      .filter(sub => sub.status === 'Ativa')
      .reduce((total, sub) => total + sub.amount, 0)
  }, [subscriptions])

  const calculateCategoriesFromExpenses = (expenses: Expense[]): Category[] => {
    const categoryTotals = new Map<string, number>()

    expenses.forEach(expense => {
      const current = categoryTotals.get(expense.category) || 0
      categoryTotals.set(expense.category, current + expense.amount)
    })

    return initialCategories.map(category => ({
      ...category,
      value: categoryTotals.get(category.name) || 0
    }))
  }

  const currentMonthExpenses = useMemo(() => getCurrentMonthExpenses() || [], [])
  const subscriptionExpenses = useMemo(() => getSubscriptionExpenses(), [getSubscriptionExpenses])

  // Estado separado para os gastos adicionados pelo usuário
  const [addedExpenses, setAddedExpenses] = useState<Expense[]>([])

  // Inicialização do monthlyData considerando gastos adicionados E assinaturas
  const [monthlyData, setMonthlyData] = useState<MonthlyData>(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const currentMonthAddedExpenses = addedExpenses.filter(expense => {
      const date = new Date(expense.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Combina gastos existentes + adicionados + assinaturas
    const allCurrentMonthExpenses = [...currentMonthAddedExpenses, ...currentMonthExpenses, ...subscriptionExpenses]
    const totalSpentWithAll = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      budget: 5000,
      spent: totalSpentWithAll,
      categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
      recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
        new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      )
    }
  })

  // Função utilitária para recalcular dados mensais incluindo assinaturas
  const recalculateMonthlyData = useCallback((updatedAddedExpenses: Expense[], budget?: number) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const currentMonthAddedExpenses = updatedAddedExpenses.filter(expense => {
      const date = new Date(expense.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Inclui assinaturas nos cálculos automaticamente
    const allCurrentMonthExpenses = [...currentMonthAddedExpenses, ...currentMonthExpenses, ...subscriptionExpenses]
    const newSpent = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    setMonthlyData(prev => ({
      ...prev,
      budget: budget ?? prev.budget,
      spent: newSpent,
      categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
      recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
        new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      )
    }))
  }, [currentMonthExpenses, subscriptionExpenses])

  // Recalcula quando as assinaturas mudam
  useEffect(() => {
    recalculateMonthlyData(addedExpenses)
  }, [subscriptions, recalculateMonthlyData, addedExpenses])

  const updateBudget = (newBudget: number) => {
    if (newBudget > 0) {
      setMonthlyData(prev => ({
        ...prev,
        budget: newBudget
      }))
    }
  }

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (!expenseData || !expenseData.description || !expenseData.category || !expenseData.amount) {
      return
    }

    const newExpense: Expense = {
      ...expenseData,
      id: Date.now()
    }

    setAddedExpenses(prev => {
      const updatedExpenses = [newExpense, ...prev]
      recalculateMonthlyData(updatedExpenses)
      return updatedExpenses
    })
  }

  const editExpense = (id: number, expenseData: Omit<Expense, 'id'>) => {
    setAddedExpenses(prev => {
      const updatedExpenses = prev.map(expense => expense.id === id
        ? { ...expense, ...expenseData }
        : expense
      )
      recalculateMonthlyData(updatedExpenses)
      return updatedExpenses
    })
  }

  const deleteExpense = (id: number) => {
    setAddedExpenses(prev => {
      const updatedExpenses = prev.filter(expense => expense.id !== id)
      recalculateMonthlyData(updatedExpenses)
      return updatedExpenses
    })
  }

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
        setSubscriptions
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
