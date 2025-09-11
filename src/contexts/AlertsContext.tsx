import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { Alert, Subscription } from '../types'
import { alerts as initialAlerts } from '../data/mockData'

interface AlertsContextType {
  alerts: Alert[]
  removeAlert: (id: number) => void
  markAllAsRead: () => void
  addAlert: (alert: Omit<Alert, 'id'>) => void

  processSubscriptionAlerts: (subscriptions: Subscription[]) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined)

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [, setSubscriptionsState] = useState<Subscription[]>([])

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const markAllAsRead = () => {
    setAlerts([])
  }

  const addAlert = useCallback((alertData: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now() + Math.random(),
      date: new Date().toISOString().split('T')[0]
    }
    setAlerts(prev => [newAlert, ...prev])
  }, [])

  // Processa alertas automáticos para assinaturas (invisível ao usuário)
  const processSubscriptionAlerts = useCallback((subs: Subscription[]) => {
    const today = new Date()

    subs.forEach(sub => {
      const paymentDate = new Date(sub.nextPayment)
      const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

      // Remove alertas antigos desta assinatura primeiro
      setAlerts(currentAlerts => {
        const filteredAlerts = currentAlerts.filter(alert =>
          !alert.message.includes(sub.name)
        )

        const newAlerts = [...filteredAlerts]

        // Alerta para pagamentos nos próximos 3 dias
        if (daysUntilPayment <= 3 && daysUntilPayment >= 0 && sub.status === 'Ativa') {
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'warning',
            title: 'Pagamento próximo',
            message: `${sub.name} vence em ${daysUntilPayment} dia${daysUntilPayment !== 1 ? 's' : ''} - R$ ${sub.amount.toFixed(2)}`,
            date: new Date().toISOString().split('T')[0]
          })
        }

        // Alerta para pagamentos em atraso
        if (daysUntilPayment < 0 && sub.status === 'Ativa') {
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'error',
            title: 'Pagamento em atraso',
            message: `${sub.name} está com pagamento em atraso - R$ ${sub.amount.toFixed(2)}`,
            date: new Date().toISOString().split('T')[0]
          })
        }

        // Alerta para assinaturas pendentes
        if (sub.status === 'Pendente') {
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'warning',
            title: 'Assinatura pendente',
            message: `${sub.name} tem pagamento pendente - R$ ${sub.amount.toFixed(2)}`,
            date: new Date().toISOString().split('T')[0]
          })
        }

        return newAlerts
      })
    })
  }, [])

  const setSubscriptions = useCallback((newSubscriptions: Subscription[]) => {
    setSubscriptionsState(newSubscriptions)
    // Automatically process alerts when subscriptions change
    processSubscriptionAlerts(newSubscriptions)
  }, [processSubscriptionAlerts])

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        removeAlert,
        markAllAsRead,
        addAlert,
        processSubscriptionAlerts,
        setSubscriptions
      }}
    >
      {children}
    </AlertsContext.Provider>
  )
}

export { AlertsContext }
