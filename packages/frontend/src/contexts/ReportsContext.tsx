import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Subscription, ReportData, MonthlyData, Expense } from '../types'
import { monthlyReports } from '../data/mockData.ts'
import { useAuth } from '../hooks/useAuth.ts'
import jsPDF from 'jspdf'

export type PeriodFilter = '3m' | '6m' | '1y'

interface ReportsContextType {
  selectedPeriod: PeriodFilter
  setSelectedPeriod: (period: PeriodFilter) => void
  getFilteredReports: () => typeof monthlyReports
  exportToPDF: () => void
  // Funções para integração com assinaturas (sem alterar visual)
  setSubscriptions: (subscriptions: Subscription[]) => void
  getSubscriptionAnalytics: () => {
    totalMonthly: number
    activeCount: number
    averageCost: number
    categoryBreakdown: { [key: string]: number }
    annualProjection: number
  }
  // Integração com alertas
  setAlertHandlers: (handlers: {
    processReportAlerts: (reportData: ReportData) => void
  }) => void
  // Novas integrações com Dashboard e Gastos
  setDashboardData: (monthlyData: MonthlyData) => void
  setExpenses: (expenses: Expense[]) => void
  setAddedExpenses: (expenses: Expense[]) => void
  getIntegratedReportData: () => {
    currentMonthSummary: {
      budget: number
      spent: number
      saved: number
      categoryBreakdown: { [key: string]: number }
      subscriptionsCost: number
      expensesCount: number
    }
    trends: {
      spendingTrend: number
      savingsTrend: number
      subscriptionsTrend: number
    }
    insights: string[]
  }
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('3m')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [userReports, setUserReports] = useState<typeof monthlyReports>([])

  // Estados para integração completa (invisível ao usuário)
  const [dashboardData, setDashboardData] = useState<MonthlyData | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [addedExpenses, setAddedExpenses] = useState<Expense[]>([])

  // Handlers para alertas (integração invisível)
  const [alertHandlers, setAlertHandlers] = useState<{
    processReportAlerts?: (reportData: ReportData) => void
  }>({})

  // Função para converter assinaturas em gastos mensais (local)
  const getSubscriptionExpenses = useCallback((): Expense[] => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return subscriptions
      .filter(sub => sub.status === 'Ativa')
      .map(sub => ({
        id: sub.id + 100000,
        description: `Assinatura ${sub.name}`,
        category: sub.category,
        amount: sub.amount,
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      }))
  }, [subscriptions])

  // Inicializar relatórios baseado no usuário
  useEffect(() => {
    if (user) {
      const userReportsKey = `reports_${user.id}`
      const storedReports = localStorage.getItem(userReportsKey)

      if (storedReports) {
        // Usuário existente - carregar dados salvos
        try {
          setUserReports(JSON.parse(storedReports))
        } catch {
          setUserReports([])
        }
      } else {
        // Novo usuário - verificar se é a conta de teste
        if (user.email === 'teste@exemplo.com') {
          setUserReports(monthlyReports)
          localStorage.setItem(userReportsKey, JSON.stringify(monthlyReports))
        } else {
          // Conta nova criada - iniciar sem relatórios
          setUserReports([])
          localStorage.setItem(userReportsKey, JSON.stringify([]))
        }
      }
    }
  }, [user])

  // Salvar relatórios no localStorage quando mudarem
  useEffect(() => {
    if (user && userReports.length >= 0) {
      const userReportsKey = `reports_${user.id}`
      localStorage.setItem(userReportsKey, JSON.stringify(userReports))
    }
  }, [userReports, user])

  // Análise automática de assinaturas para relatórios (movido para antes de getFilteredReports)
  const getSubscriptionAnalytics = useCallback(() => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Ativa')
    const totalMonthly = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    const averageCost = activeSubscriptions.length > 0 ? totalMonthly / activeSubscriptions.length : 0
    const annualProjection = totalMonthly * 12

    // Breakdown por categoria
    const categoryBreakdown: { [key: string]: number } = {}
    activeSubscriptions.forEach(sub => {
      categoryBreakdown[sub.category] = (categoryBreakdown[sub.category] || 0) + sub.amount
    })

    return {
      totalMonthly,
      activeCount: activeSubscriptions.length,
      averageCost,
      categoryBreakdown,
      annualProjection
    }
  }, [subscriptions])

  // Função para obter relatórios filtrados (considerando dados do usuário)
  const getFilteredReports = useCallback(() => {
    const months = {
      '3m': 3,
      '6m': 6,
      '1y': 12
    }

    const reports = userReports.slice(0, months[selectedPeriod])

    // Remover processamento de alertas para evitar setState durante render
    // Os alertas serão processados apenas quando explicitamente solicitado
    return reports
  }, [userReports, selectedPeriod])

  // Função separada para processar alertas (chamada apenas quando necessário)
  const processReportAlertsIfNeeded = useCallback(() => {
    if (alertHandlers.processReportAlerts) {
      const reports = userReports.slice(0, {
        '3m': 3,
        '6m': 6,
        '1y': 12
      }[selectedPeriod])

      const reportData = {
        trends: reports,
        period: selectedPeriod,
        subscriptionAnalytics: getSubscriptionAnalytics()
      }
      alertHandlers.processReportAlerts(reportData)
    }
  }, [userReports, selectedPeriod, alertHandlers, getSubscriptionAnalytics])

  // Processar alertas em useEffect para evitar setState durante render
  useEffect(() => {
    const timer = setTimeout(() => {
      processReportAlertsIfNeeded()
    }, 0)
    return () => clearTimeout(timer)
  }, [processReportAlertsIfNeeded])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getPeriodLabel = (period: PeriodFilter) => {
    const labels = {
      '3m': 'Últimos 3 meses',
      '6m': 'Últimos 6 meses',
      '1y': 'Último ano'
    }
    return labels[period]
  }

  const exportToPDF = () => {
    const filteredReports = getFilteredReports()
    const subscriptionAnalytics = getSubscriptionAnalytics()
    const integratedData = getIntegratedReportData()
    const doc = new jsPDF()

    // Configurações
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = 30

    // Título do relatório
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text('Relatório Financeiro Integrado', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Período: ${getPeriodLabel(selectedPeriod)}`, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 20

    // NOVA SEÇÃO: Resumo do Mês Atual Integrado
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text('Resumo do Mês Atual', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`• Orçamento: ${formatCurrency(integratedData.currentMonthSummary.budget)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Gasto Total: ${formatCurrency(integratedData.currentMonthSummary.spent)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Economia: ${formatCurrency(integratedData.currentMonthSummary.saved)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Gastos com Assinaturas: ${formatCurrency(integratedData.currentMonthSummary.subscriptionsCost)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Total de Transações: ${integratedData.currentMonthSummary.expensesCount}`, margin, yPosition)
    yPosition += 20

    // NOVA SEÇÃO: Análise de Tendências
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text('Análise de Tendências', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const spendingTrendText = integratedData.trends.spendingTrend > 0 ?
      `↗ Aumento de ${integratedData.trends.spendingTrend.toFixed(1)}%` :
      `↘ Redução de ${Math.abs(integratedData.trends.spendingTrend).toFixed(1)}%`
    doc.text(`• Tendência de Gastos: ${spendingTrendText}`, margin, yPosition)
    yPosition += 8

    const savingsTrendText = integratedData.trends.savingsTrend > 0 ?
      `↗ Melhoria de ${integratedData.trends.savingsTrend.toFixed(1)}%` :
      `↘ Redução de ${Math.abs(integratedData.trends.savingsTrend).toFixed(1)}%`
    doc.text(`• Tendência de Economia: ${savingsTrendText}`, margin, yPosition)
    yPosition += 8

    if (integratedData.trends.subscriptionsTrend !== 0) {
      const subscriptionsTrendText = integratedData.trends.subscriptionsTrend > 0 ?
        `↗ Crescimento de ${integratedData.trends.subscriptionsTrend.toFixed(1)}%` :
        `↘ Redução de ${Math.abs(integratedData.trends.subscriptionsTrend).toFixed(1)}%`
      doc.text(`• Tendência de Assinaturas: ${subscriptionsTrendText}`, margin, yPosition)
      yPosition += 8
    }
    yPosition += 12

    // NOVA SEÇÃO: Insights Automáticos
    if (integratedData.insights.length > 0) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text('Insights e Recomendações', margin, yPosition)
      yPosition += 15

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      integratedData.insights.forEach(insight => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 30
        }
        doc.text(`• ${insight}`, margin, yPosition)
        yPosition += 8
      })
      yPosition += 12
    }

    // Seção de Categorias Integradas (Dashboard + Assinaturas)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text('Distribuição de Gastos por Categoria', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    // Combinar categorias do dashboard com assinaturas
    const allCategories = { ...integratedData.currentMonthSummary.categoryBreakdown }
    Object.entries(subscriptionAnalytics.categoryBreakdown).forEach(([category, amount]) => {
      allCategories[category] = (allCategories[category] || 0) + amount
    })

    const sortedCategories = Object.entries(allCategories)
      .sort(([,a], [,b]) => b - a)
      .filter(([,amount]) => amount > 0)

    sortedCategories.forEach(([category, amount]) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 30
      }
      const percentage = ((amount / integratedData.currentMonthSummary.spent) * 100).toFixed(1)
      doc.text(`• ${category}: ${formatCurrency(amount)} (${percentage}%)`, margin, yPosition)
      yPosition += 7
    })
    yPosition += 15

    // Detalhamento por Mês
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text('Detalhamento por Mês', margin, yPosition)
    yPosition += 15

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    filteredReports.reverse().forEach((report) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 30
      }

      doc.setFont("helvetica", "bold")
      doc.text(report.month, margin, yPosition)
      yPosition += 8

      doc.setFont("helvetica", "normal")
      doc.text(`  Orçamento: ${formatCurrency(report.budget)}`, margin, yPosition)
      yPosition += 6
      doc.text(`  Gasto: ${formatCurrency(report.spent)}`, margin, yPosition)
      yPosition += 6
      doc.text(`  Economia: ${formatCurrency(report.saved)}`, margin, yPosition)
      yPosition += 6

      const utilizacao = (report.spent / report.budget) * 100
      doc.text(`  Utilização: ${utilizacao.toFixed(1)}%`, margin, yPosition)
      yPosition += 12
    })

    // Categorias do mês mais recente
    const latestReport = filteredReports[0]
    if (latestReport && yPosition < 200) {
      yPosition += 10
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text('Gastos por Categoria (Mês Atual)', margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      latestReport.categories
        .filter(cat => cat.value > 0)
        .sort((a, b) => b.value - a.value)
        .forEach((category) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 30
          }
          doc.text(`• ${category.name}: ${formatCurrency(category.value)}`, margin, yPosition)
          yPosition += 7
        })
    }

    // Rodapé atualizado
    const currentDate = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(`Relatório integrado gerado em ${currentDate}`, margin, doc.internal.pageSize.height - 10)

    // Download do PDF
    doc.save(`relatorio-integrado-${selectedPeriod}-${currentDate.replace(/\//g, '-')}.pdf`)
  }

  // Sincronizar gastos с reports (corrigido)
  useEffect(() => {
    // Combinar gastos manuais com gastos de assinaturas para relatórios completos
    const subscriptionExpenses = getSubscriptionExpenses()
    const allExpenses = [...addedExpenses, ...subscriptionExpenses]
    setExpenses(allExpenses)
  }, [addedExpenses, getSubscriptionExpenses, subscriptions]) // Adicionando subscriptions às dependências

  // Nova função para análise integrada de dados (corrigida)
  const getIntegratedReportData = useCallback(() => {
    const subscriptionAnalytics = getSubscriptionAnalytics()
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Filtrar gastos do mês atual incluindo TODOS os tipos de gastos
    const currentMonthExpenses = expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth &&
             expenseDate.getFullYear() === currentYear
    })

    // Incluir também gastos adicionados que podem não estar em expenses ainda
    const allCurrentMonthExpenses = [...currentMonthExpenses, ...addedExpenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth &&
             expenseDate.getFullYear() === currentYear
    })]

    // Remover duplicatas baseado no ID
    const uniqueExpenses = allCurrentMonthExpenses.reduce((acc: Expense[], expense: Expense) => {
      if (!acc.find((e: Expense) => e.id === expense.id)) {
        acc.push(expense)
      }
      return acc
    }, [] as Expense[])

    // Resumo do mês atual integrando todas as fontes
    const currentMonthSummary = {
      budget: dashboardData?.budget || 0,
      spent: dashboardData?.spent || 0,
      saved: Math.max(0, (dashboardData?.budget || 0) - (dashboardData?.spent || 0)),
      categoryBreakdown: dashboardData?.categories.reduce((acc: { [key: string]: number }, cat: { name: string; value: number }) => {
        acc[cat.name] = cat.value
        return acc
      }, {}) || {},
      subscriptionsCost: subscriptionAnalytics.totalMonthly,
      expensesCount: uniqueExpenses.length
    }

    // Calcular tendências baseadas nos relatórios históricos
    const filteredReports = getFilteredReports()
    const trends = {
      spendingTrend: 0,
      savingsTrend: 0,
      subscriptionsTrend: 0
    }

    if (filteredReports.length >= 2) {
      const latest = filteredReports[0]
      const previous = filteredReports[1]

      trends.spendingTrend = ((latest.spent - previous.spent) / previous.spent) * 100
      trends.savingsTrend = ((latest.saved - previous.saved) / previous.saved) * 100

      // Tendência de assinaturas (estimativa baseada no crescimento de gastos)
      trends.subscriptionsTrend = subscriptionAnalytics.totalMonthly > 0 ?
        Math.min(trends.spendingTrend * 0.3, 20) : 0
    }

    // Gerar insights automaticamente
    const insights: string[] = []

    if (currentMonthSummary.subscriptionsCost > 0) {
      const subscriptionPercentage = (currentMonthSummary.subscriptionsCost / currentMonthSummary.budget) * 100
      if (subscriptionPercentage > 20) {
        insights.push(`Assinaturas representam ${subscriptionPercentage.toFixed(1)}% do orçamento`)
      }
    }

    if (trends.spendingTrend > 15) {
      insights.push(`Gastos aumentaram ${trends.spendingTrend.toFixed(1)}% comparado ao período anterior`)
    }

    if (trends.savingsTrend < -10) {
      insights.push(`Economia diminuiu ${Math.abs(trends.savingsTrend).toFixed(1)}% no período`)
    }

    if (currentMonthSummary.expensesCount > 50) {
      insights.push(`Alto volume de transações: ${currentMonthSummary.expensesCount} gastos registrados`)
    }

    const budgetUsage = (currentMonthSummary.spent / currentMonthSummary.budget) * 100
    if (budgetUsage > 90) {
      insights.push(`Utilização crítica do orçamento: ${budgetUsage.toFixed(1)}%`)
    }

    return {
      currentMonthSummary,
      trends,
      insights
    }
  }, [subscriptions, dashboardData, expenses, addedExpenses, getSubscriptionAnalytics, getFilteredReports])

  const setAlertHandlersFunc = useCallback((handlers: {
    processReportAlerts: (reportData: ReportData) => void
  }) => {
    setAlertHandlers(handlers)
  }, [])

  return (
    <ReportsContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        getFilteredReports,
        exportToPDF,
        setSubscriptions,
        getSubscriptionAnalytics,
        setAlertHandlers: setAlertHandlersFunc,
        setDashboardData,
        setExpenses,
        setAddedExpenses,
        getIntegratedReportData
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export { ReportsContext }
