import { createContext, useState, type ReactNode } from 'react'
import type { MonthlyData, Expense, Category } from '../types'
import { categories as initialCategories, recentExpenses as initialExpenses } from '../data/mockData'

interface DashboardContextType {
  monthlyData: MonthlyData
  updateBudget: (newBudget: number) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
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

  const currentMonthExpenses = getCurrentMonthExpenses() || []
  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0)

  // Estado separado para os gastos adicionados pelo usuário
  const [addedExpenses, setAddedExpenses] = useState<Expense[]>([])

  const [monthlyData, setMonthlyData] = useState<MonthlyData>({
    budget: 5000,
    spent: totalSpent,
    categories: calculateCategoriesFromExpenses(currentMonthExpenses),
    recentExpenses: currentMonthExpenses.slice(0, 5).sort((a, b) =>
      new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    )
  })

  const updateBudget = (newBudget: number) => {
    if (newBudget > 0) {
      setMonthlyData(prev => prev ? {
        ...prev,
        budget: newBudget
      } : prev)
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

    // Adiciona ao estado dos gastos adicionados
    setAddedExpenses(prev => [newExpense, ...prev])

    setMonthlyData(prev => {
      if (!prev) return prev

      // Combina gastos existentes com os novos gastos adicionados
      const allExpenses = [newExpense, ...addedExpenses, ...currentMonthExpenses]
      const newSpent = prev.spent + newExpense.amount

      return {
        ...prev,
        spent: newSpent,
        categories: calculateCategoriesFromExpenses(allExpenses),
        recentExpenses: allExpenses.slice(0, 5).sort((a, b) =>
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        )
      }
    })
  }

  return (
    <DashboardContext.Provider
      value={{
        monthlyData,
        updateBudget,
        addExpense,
        getCurrentMonth
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export { DashboardContext }
