import { useContext } from 'react'
import { DashboardContext } from '../contexts/DashboardContext.tsx'

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  const {
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
    setAlertHandlers
  } = context

  return {
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
    setAlertHandlers
  }
}
