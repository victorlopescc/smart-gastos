import { useContext } from 'react'
import { AlertsContext } from '../contexts/AlertsContext'

export const useAlerts = () => {
  const context = useContext(AlertsContext)
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider')
  }
  return context
}
