import { useContext } from 'react'
import { AlertsContext } from '../contexts/AlertsContext'

export const useAlerts = () => {
  const context = useContext(AlertsContext)
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider')
  }

  const {
    alerts,
    removeAlert,
    markAllAsRead,
    addAlert,
    // Novas funções para integração com assinaturas
    processSubscriptionAlerts,
    setSubscriptions,
    // Funções para integração com dashboard e reports
    processBudgetAlerts,
    processExpenseAlerts,
    processReportAlerts
  } = context

  return {
    alerts,
    removeAlert,
    markAllAsRead,
    addAlert,
    processSubscriptionAlerts,
    setSubscriptions,
    processBudgetAlerts,
    processExpenseAlerts,
    processReportAlerts
  }
}
