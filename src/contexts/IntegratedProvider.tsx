import { createContext, useEffect, type ReactNode } from 'react'
import { ThemeProvider } from './ThemeContext'
import { DashboardProvider } from './DashboardContext'
import { SubscriptionsProvider } from './SubscriptionsContext'
import { AlertsProvider } from './AlertsContext'
import { ReportsProvider } from './ReportsContext'
import { useDashboard } from '../hooks/useDashboard'
import { useSubscriptions } from '../hooks/useSubscriptions'
import { useAlerts } from '../hooks/useAlerts'
import { useReports } from '../hooks/useReports'

// Componente interno que coordena a integração (invisível para o usuário)
function IntegrationCoordinator({ children }: { children: ReactNode }) {
  const { subscriptions } = useSubscriptions()
  const { setSubscriptions: setDashboardSubscriptions } = useDashboard()
  const { processSubscriptionAlerts, setSubscriptions: setAlertsSubscriptions } = useAlerts()
  const { setSubscriptions: setReportsSubscriptions } = useReports()

  // Sincroniza automaticamente as assinaturas com todos os contextos
  useEffect(() => {
    // Atualiza o dashboard com dados das assinaturas
    setDashboardSubscriptions(subscriptions)

    // Atualiza os alertas com dados das assinaturas
    setAlertsSubscriptions(subscriptions)
    processSubscriptionAlerts(subscriptions)

    // Atualiza os relatórios com dados das assinaturas
    setReportsSubscriptions(subscriptions)
  }, [subscriptions, setDashboardSubscriptions, setAlertsSubscriptions, processSubscriptionAlerts, setReportsSubscriptions])

  // Verifica alertas periodicamente (a cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      processSubscriptionAlerts(subscriptions)
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [subscriptions, processSubscriptionAlerts])

  return <>{children}</>
}

// Contexto para coordenar a integração entre todos os providers
interface IntegrationContextType {
  isIntegrated: boolean
  subscriptionsCount: number
  lastSync: Date | null
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined)

// Provider principal que integra todas as funcionalidades
export function IntegratedProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <SubscriptionsProvider>
          <AlertsProvider>
            <ReportsProvider>
              <IntegrationContext.Provider
                value={{
                  isIntegrated: true,
                  subscriptionsCount: 0,
                  lastSync: null
                }}
              >
                <IntegrationCoordinator>
                  {children}
                </IntegrationCoordinator>
              </IntegrationContext.Provider>
            </ReportsProvider>
          </AlertsProvider>
        </SubscriptionsProvider>
      </DashboardProvider>
    </ThemeProvider>
  )
}
