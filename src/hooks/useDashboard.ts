import { useContext } from 'react'
import { DashboardContext } from '../contexts/DashboardContext'

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  const { monthlyData, updateBudget, addExpense, editExpense, deleteExpense, getCurrentMonth } = context
  return { monthlyData, updateBudget, addExpense, editExpense, deleteExpense, getCurrentMonth }
}
