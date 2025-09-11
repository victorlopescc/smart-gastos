import { useContext } from 'react'
import { ReportsContext } from '../contexts/ReportsContext'

export const useReports = () => {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider')
  }

  const {
    selectedPeriod,
    setSelectedPeriod,
    getFilteredReports,
    exportToPDF,
    // Novas funções para integração com assinaturas
    setSubscriptions,
    getSubscriptionAnalytics,
    setAlertHandlers
  } = context

  return {
    selectedPeriod,
    setSelectedPeriod,
    getFilteredReports,
    exportToPDF,
    setSubscriptions,
    getSubscriptionAnalytics,
    setAlertHandlers
  }
}
