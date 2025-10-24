import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { Alert, Subscription, Expense, MonthlyData, ReportData } from '../types'
import { alerts as initialAlerts } from '../data/mockData.ts'

interface AlertsContextType {
  alerts: Alert[]
  removeAlert: (id: number) => void
  markAllAsRead: () => void
  addAlert: (alert: Omit<Alert, 'id'>) => void
  processSubscriptionAlerts: (subscriptions: Subscription[]) => void
  setSubscriptions: (subscriptions: Subscription[]) => void
  // Novas integrações
  processBudgetAlerts: (monthlyData: MonthlyData) => void
  processExpenseAlerts: (expenses: Expense[], monthlyData: MonthlyData) => void
  processReportAlerts: (reportData: ReportData) => void
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

    // Remove alertas antigos de assinaturas primeiro
    setAlerts(currentAlerts => {
      const filteredAlerts = currentAlerts.filter(alert =>
        !alert.message.includes('Netflix') &&
        !alert.message.includes('Spotify') &&
        !alert.message.includes('Amazon Prime') &&
        !alert.message.includes('iCloud') &&
        !alert.message.includes('Adobe Creative') &&
        !alert.title.includes('Pagamento próximo') &&
        !alert.title.includes('Pagamento em atraso') &&
        !alert.title.includes('Assinatura pendente')
      )

      const newAlerts = [...filteredAlerts]

      subs.forEach(sub => {
        // Para assinaturas pendentes, sempre mostrar alerta
        if (sub.status === 'Pendente') {
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'warning',
            title: 'Assinatura pendente',
            message: `${sub.name} tem pagamento pendente - R$ ${sub.amount.toFixed(2)}`,
            date: new Date().toISOString().split('T')[0]
          })
          return
        }

        // Para assinaturas ativas, calcular próximo pagamento baseado na data atual
        if (sub.status === 'Ativa') {
          const paymentDate = new Date(sub.nextPayment)
          const currentMonth = today.getMonth()
          const currentYear = today.getFullYear()

          // Se a data de pagamento é de um mês passado, calcular próximo pagamento
          let nextPaymentDate = new Date(paymentDate)

          if (paymentDate.getMonth() < currentMonth || paymentDate.getFullYear() < currentYear) {
            // Assumindo pagamento mensal, avançar para o próximo ciclo
            nextPaymentDate = new Date(currentYear, currentMonth + 1, paymentDate.getDate())
          } else if (paymentDate.getMonth() === currentMonth && paymentDate.getDate() < today.getDate()) {
            // Se já passou no mês atual, avançar para próximo mês
            nextPaymentDate = new Date(currentYear, currentMonth + 1, paymentDate.getDate())
          }

          const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))

          // Alerta para pagamentos nos próximos 3 dias
          if (daysUntilPayment <= 3 && daysUntilPayment >= 0) {
            newAlerts.unshift({
              id: Date.now() + Math.random(),
              type: 'warning',
              title: 'Pagamento próximo',
              message: `${sub.name} vence em ${daysUntilPayment} dia${daysUntilPayment !== 1 ? 's' : ''} - R$ ${sub.amount.toFixed(2)}`,
              date: new Date().toISOString().split('T')[0]
            })
          }

          // Alerta para pagamentos em atraso (se passou da data e ainda não foi pago)
          if (daysUntilPayment < 0 && Math.abs(daysUntilPayment) <= 5) {
            newAlerts.unshift({
              id: Date.now() + Math.random(),
              type: 'error',
              title: 'Pagamento em atraso',
              message: `${sub.name} está ${Math.abs(daysUntilPayment)} dia${Math.abs(daysUntilPayment) !== 1 ? 's' : ''} em atraso - R$ ${sub.amount.toFixed(2)}`,
              date: new Date().toISOString().split('T')[0]
            })
          }
        }
      })

      return newAlerts
    })
  }, [])

  // Processa alertas automáticos para orçamento
  const processBudgetAlerts = useCallback((monthlyData: MonthlyData) => {
    const budgetUsagePercentage = (monthlyData.spent / monthlyData.budget) * 100

    // Remove alertas antigos de orçamento
    setAlerts(currentAlerts => {
      const filteredAlerts = currentAlerts.filter(alert =>
        !alert.message.includes('orçamento') &&
        !alert.message.includes('gastos') &&
        !alert.title.includes('Orçamento')
      )

      const newAlerts = [...filteredAlerts]

      // Alerta quando ultrapassa 80% do orçamento
      if (budgetUsagePercentage >= 80 && budgetUsagePercentage < 100) {
        newAlerts.unshift({
          id: Date.now() + Math.random(),
          type: 'warning',
          title: 'Orçamento em alerta',
          message: `Você já gastou ${budgetUsagePercentage.toFixed(1)}% do seu orçamento mensal (R$ ${monthlyData.spent.toFixed(2)} de R$ ${monthlyData.budget.toFixed(2)})`,
          date: new Date().toISOString().split('T')[0]
        })
      }

      // Alerta quando ultrapassa 100% do orçamento
      if (budgetUsagePercentage >= 100) {
        const exceededAmount = monthlyData.spent - monthlyData.budget
        newAlerts.unshift({
          id: Date.now() + Math.random(),
          type: 'error',
          title: 'Orçamento ultrapassado',
          message: `Você ultrapassou seu orçamento em R$ ${exceededAmount.toFixed(2)}! Total gasto: R$ ${monthlyData.spent.toFixed(2)}`,
          date: new Date().toISOString().split('T')[0]
        })
      }

      return newAlerts
    })
  }, [])

  // Processa alertas automáticos para gastos por categoria
  const processExpenseAlerts = useCallback((expenses: Expense[], monthlyData: MonthlyData) => {
    // Remove alertas antigos de categoria
    setAlerts(currentAlerts => {
      const filteredAlerts = currentAlerts.filter(alert =>
        !alert.message.includes('categoria') &&
        !alert.title.includes('Gasto alto')
      )

      const newAlerts = [...filteredAlerts]

      // Verifica gastos altos por categoria (mais de 30% do orçamento)
      monthlyData.categories.forEach(category => {
        const categoryPercentage = (category.value / monthlyData.budget) * 100

        if (categoryPercentage > 30) {
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'warning',
            title: 'Gasto alto por categoria',
            message: `Categoria "${category.name}" representa ${categoryPercentage.toFixed(1)}% do orçamento (R$ ${category.value.toFixed(2)})`,
            date: new Date().toISOString().split('T')[0]
          })
        }
      })

      // Alerta para gastos únicos altos (mais de 20% do orçamento)
      const recentHighExpenses = expenses.filter(expense => {
        const expensePercentage = (expense.amount / monthlyData.budget) * 100
        return expensePercentage > 20
      })

      recentHighExpenses.forEach(expense => {
        const expensePercentage = (expense.amount / monthlyData.budget) * 100
        newAlerts.unshift({
          id: Date.now() + Math.random(),
          type: 'info',
          title: 'Gasto alto detectado',
          message: `Gasto "${expense.description}" de R$ ${expense.amount.toFixed(2)} representa ${expensePercentage.toFixed(1)}% do orçamento`,
          date: new Date().toISOString().split('T')[0]
        })
      })

      return newAlerts
    })
  }, [])

  // Processa alertas automáticos para relatórios
  const processReportAlerts = useCallback((reportData: ReportData) => {
    if (!reportData) return

    // Remove alertas antigos de relatórios
    setAlerts(currentAlerts => {
      const filteredAlerts = currentAlerts.filter(alert =>
        !alert.message.includes('tendência') &&
        !alert.title.includes('Relatório')
      )

      const newAlerts = [...filteredAlerts]

      // Alerta para tendências de aumento de gastos
      if (reportData.trends && reportData.trends.length > 1) {
        const lastTrend = reportData.trends[reportData.trends.length - 1]
        const previousTrend = reportData.trends[reportData.trends.length - 2]

        if (lastTrend && previousTrend && lastTrend.spent > previousTrend.spent * 1.2) {
          const increasePercentage = ((lastTrend.spent - previousTrend.spent) / previousTrend.spent) * 100
          newAlerts.unshift({
            id: Date.now() + Math.random(),
            type: 'warning',
            title: 'Relatório: Tendência de aumento',
            message: `Seus gastos aumentaram ${increasePercentage.toFixed(1)}% em relação ao período anterior`,
            date: new Date().toISOString().split('T')[0]
          })
        }
      }

      return newAlerts
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
        setSubscriptions,
        processBudgetAlerts,
        processExpenseAlerts,
        processReportAlerts
      }}
    >
      {children}
    </AlertsContext.Provider>
  )
}

export { AlertsContext }
