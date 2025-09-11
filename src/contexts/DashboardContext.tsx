import { createContext, useState, type ReactNode } from 'react'
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

    // Verifica se o gasto é do mês atual
    const expenseDate = new Date(newExpense.date)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const isCurrentMonth = expenseDate.getMonth() === currentMonth &&
                           expenseDate.getFullYear() === currentYear

    setMonthlyData(prev => {
      if (!prev) return prev

      // Filtra apenas gastos do mês atual para cálculos
      const currentMonthAddedExpenses = addedExpenses.filter(expense => {
        const date = new Date(expense.date)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })

      // Combina gastos existentes com os novos gastos adicionados do mês atual
      const allCurrentMonthExpenses = isCurrentMonth
        ? [newExpense, ...currentMonthAddedExpenses, ...currentMonthExpenses]
        : [...currentMonthAddedExpenses, ...currentMonthExpenses]

      // Calcula o novo valor gasto apenas com gastos do mês atual
      const newSpent = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      return {
        ...prev,
        spent: newSpent,
        categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
        recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        )
      }
    })
  }

  const editExpense = (id: number, expenseData: Omit<Expense, 'id'>) => {
    setAddedExpenses(prev => {
      const updatedExpenses = prev.map(expense => expense.id === id
        ? { ...expense, ...expenseData }
        : expense
      )

      // Atualiza o monthlyData com os gastos atualizados
      setMonthlyData(prevData => {
        if (!prevData) return prevData

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        // Filtra gastos do mês atual dos gastos atualizados
        const currentMonthUpdatedExpenses = updatedExpenses.filter(expense => {
          const date = new Date(expense.date)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })

        // Combina com gastos iniciais do mês atual
        const allCurrentMonthExpenses = [...currentMonthUpdatedExpenses, ...currentMonthExpenses]

        // Calcula o novo valor gasto
        const newSpent = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          ...prevData,
          spent: newSpent,
          categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
          recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
            new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
          )
        }
      })

      return updatedExpenses
    })
  }

  const deleteExpense = (id: number) => {
    setAddedExpenses(prev => {
      const updatedExpenses = prev.filter(expense => expense.id !== id)

      // Atualiza o monthlyData com os gastos atualizados
      setMonthlyData(prevData => {
        if (!prevData) return prevData

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        // Filtra gastos do mês atual dos gastos atualizados
        const currentMonthUpdatedExpenses = updatedExpenses.filter(expense => {
          const date = new Date(expense.date)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })

        // Combina com gastos iniciais do mês atual
        const allCurrentMonthExpenses = [...currentMonthUpdatedExpenses, ...currentMonthExpenses]

        // Calcula o novo valor gasto
        const newSpent = allCurrentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          ...prevData,
          spent: newSpent,
          categories: calculateCategoriesFromExpenses(allCurrentMonthExpenses),
          recentExpenses: allCurrentMonthExpenses.slice(0, 5).sort((a, b) =>
            new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
          )
        }
      })

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
