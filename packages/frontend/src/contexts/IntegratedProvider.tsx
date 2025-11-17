import { createContext, useEffect, type ReactNode } from 'react'
import { ThemeProvider } from './ThemeContext.tsx'
import { DashboardProvider } from './DashboardContext.tsx'
import { SubscriptionsProvider } from './SubscriptionsContext.tsx'
import { AlertsProvider } from './AlertsContext.tsx'
import { ReportsProvider } from './ReportsContext.tsx'
import { useDashboard } from '../hooks/useDashboard.ts'
import { useSubscriptions } from '../hooks/useSubscriptions.ts'
import { useAlerts } from '../hooks/useAlerts.ts'
import { useReports } from '../hooks/useReports.ts'

// Componente interno que coordena a integração (invisível para o usuário)
function IntegrationCoordinator({ children }: { children: ReactNode }) {
  const { subscriptions } = useSubscriptions()
  const {
    setSubscriptions: setDashboardSubscriptions,
    setAlertHandlers: setDashboardAlertHandlers,
    monthlyData,
    addedExpenses
  } = useDashboard()
  const {
    processSubscriptionAlerts,
    setSubscriptions: setAlertsSubscriptions,
    processBudgetAlerts,
    processExpenseAlerts,
    processReportAlerts
  } = useAlerts()
  const {
    setSubscriptions: setReportsSubscriptions,
    setAlertHandlers: setReportsAlertHandlers,
    setDashboardData: setReportsDashboardData,
    setExpenses: setReportsExpenses
  } = useReports()

  // Configura os handlers de alertas uma única vez
  useEffect(() => {
    // Dashboard -> Alertas (orçamento e gastos)
    setDashboardAlertHandlers({
      processBudgetAlerts,
      processExpenseAlerts
    })

    // Reports -> Alertas (tendências)
    setReportsAlertHandlers({
      processReportAlerts
    })
  }, [setDashboardAlertHandlers, processBudgetAlerts, processExpenseAlerts, setReportsAlertHandlers, processReportAlerts])

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

  // NOVA INTEGRAÇÃO: Sincroniza dados do Dashboard com Reports
  useEffect(() => {
    if (monthlyData) {
      setReportsDashboardData(monthlyData)
      processBudgetAlerts(monthlyData)
    }
  }, [monthlyData, setReportsDashboardData, processBudgetAlerts])

  // NOVA INTEGRAÇÃO: Sincroniza gastos com Reports
  useEffect(() => {
    setReportsExpenses(addedExpenses)
    if (addedExpenses.length > 0 && monthlyData) {
      processExpenseAlerts(addedExpenses, monthlyData)
    }
  }, [addedExpenses, setReportsExpenses, monthlyData, processExpenseAlerts])

  // Verifica alertas de assinaturas periodicamente (a cada 30 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      processSubscriptionAlerts(subscriptions)
    }, 30 * 60 * 1000) // 30 minutos

    return () => clearInterval(interval)
  }, [subscriptions, processSubscriptionAlerts])

  // Verifica alertas de orçamento periodicamente (a cada hora)
  useEffect(() => {
    const interval = setInterval(() => {
      if (monthlyData) {
        processBudgetAlerts(monthlyData)
      }
    }, 60 * 60 * 1000) // 1 hora

    return () => clearInterval(interval)
  }, [monthlyData, processBudgetAlerts])

  return <>{children}</>
}

// Contexto para coordenar a integração entre todos os providers
interface IntegrationContextType {
  isIntegrated: boolean
  subscriptionsCount: number
  lastSync: Date | null
  alertsEnabled: boolean
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
                  lastSync: new Date(),
                  alertsEnabled: true
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
