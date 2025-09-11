import { createContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { MonthlyData, Expense, Category } from '../types'
import { categories as initialCategories, recentExpenses as initialExpenses } from '../data/mockData'

interface DashboardContextType {
  monthlyData: MonthlyData
  updateBudget: (newBudget: number) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  editExpense: (id: number, expense: Omit<Expense, 'id'>) => void
  deleteExpense: (id: number) => void
  getCurrentMonth: () => string
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
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

  // Estado separado para os gastos adicionados pelo usuário
  const [addedExpenses, setAddedExpenses] = useState<Expense[]>([])

  // Inicialização do monthlyData considerando gastos adicionados
  const [monthlyData, setMonthlyData] = useState<MonthlyData>(() => {
    // Filtra gastos do mês atual dos gastos adicionados
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const currentMonthAddedExpenses = addedExpenses.filter(expense => {
      const date = new Date(expense.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Combina gastos existentes com adicionados
    const allCurrentMonthExpenses = [...currentMonthAddedExpenses, ...currentMonthExpenses]
    const totalSpentWithAdded = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      budget: 5000,
      spent: totalSpentWithAdded,
      categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
      recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
        new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      )
    }
  })

  // Função utilitária para recalcular dados mensais
  const recalculateMonthlyData = useCallback((updatedAddedExpenses: Expense[], budget?: number) => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Filtra gastos do mês atual dos gastos adicionados
    const currentMonthAddedExpenses = updatedAddedExpenses.filter(expense => {
      const date = new Date(expense.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Combina com gastos iniciais do mês atual
    const allCurrentMonthExpenses = [...currentMonthAddedExpenses, ...currentMonthExpenses]

    // Calcula o novo valor gasto
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
  }, [currentMonthExpenses])

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
        updateBudget,
        addExpense,
        editExpense,
        deleteExpense,
        getCurrentMonth
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
