import { createContext, useState, type ReactNode } from 'react'
import type { Alert } from '../types'
import { alerts as initialAlerts } from '../data/mockData'

interface AlertsContextType {
  alerts: Alert[]
  removeAlert: (id: number) => void
  markAllAsRead: () => void
  addAlert: (alert: Omit<Alert, 'id'>) => void
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined)

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const markAllAsRead = () => {
    setAlerts([])
  }

  const addAlert = (alertData: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    }
    setAlerts(prev => [newAlert, ...prev])
  }

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        removeAlert,
        markAllAsRead,
        addAlert
      }}
    >
      {children}
    </AlertsContext.Provider>
  )
}

export { AlertsContext }
