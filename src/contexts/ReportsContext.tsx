import { createContext, useState, useCallback, type ReactNode } from 'react'
import type { Subscription, ReportData } from '../types'
import { monthlyReports } from '../data/mockData'
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
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('3m')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  // Handlers para alertas (integração invisível)
  const [alertHandlers, setAlertHandlers] = useState<{
    processReportAlerts?: (reportData: ReportData) => void
  }>({})

  const getFilteredReports = () => {
    const months = {
      '3m': 3,
      '6m': 6,
      '1y': 12
    }

    const reports = monthlyReports.slice(0, months[selectedPeriod])

    // Processar alertas automaticamente quando dados do relatório mudam
    if (alertHandlers.processReportAlerts) {
      const reportData = {
        trends: reports,
        period: selectedPeriod,
        subscriptionAnalytics: getSubscriptionAnalytics()
      }
      alertHandlers.processReportAlerts(reportData)
    }

    return reports
  }

  // Análise automática de assinaturas para relatórios
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
    const doc = new jsPDF()

    // Configurações
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = 30

    // Título do relatório
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text('Relatório Financeiro Completo', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Período: ${getPeriodLabel(selectedPeriod)}`, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 20

    // Cálculos dos dados originais
    const totalSaved = filteredReports.reduce((sum, report) => sum + report.saved, 0)
    const averageSpending = filteredReports.reduce((sum, report) => sum + report.spent, 0) / filteredReports.length
    const maxSavings = Math.max(...filteredReports.map(r => r.saved))
    const totalSpent = filteredReports.reduce((sum, report) => sum + report.spent, 0)

    // Resumo Executivo
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text('Resumo Executivo', margin, yPosition)
    yPosition += 15

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`• Economia Total: ${formatCurrency(totalSaved)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Gasto Médio Mensal: ${formatCurrency(averageSpending)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Maior Economia: ${formatCurrency(maxSavings)}`, margin, yPosition)
    yPosition += 8
    doc.text(`• Total Gasto no Período: ${formatCurrency(totalSpent)}`, margin, yPosition)
    yPosition += 20

    // Seção de Assinaturas (integração invisível)
    if (subscriptions.length > 0) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text('Análise de Assinaturas', margin, yPosition)
      yPosition += 15

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(`• Assinaturas Ativas: ${subscriptionAnalytics.activeCount}`, margin, yPosition)
      yPosition += 8
      doc.text(`• Custo Mensal Total: ${formatCurrency(subscriptionAnalytics.totalMonthly)}`, margin, yPosition)
      yPosition += 8
      doc.text(`• Custo Médio por Assinatura: ${formatCurrency(subscriptionAnalytics.averageCost)}`, margin, yPosition)
      yPosition += 8
      doc.text(`• Projeção Anual: ${formatCurrency(subscriptionAnalytics.annualProjection)}`, margin, yPosition)
      yPosition += 15

      // Breakdown por categoria
      if (Object.keys(subscriptionAnalytics.categoryBreakdown).length > 0) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text('Gastos por Categoria de Assinatura:', margin, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        Object.entries(subscriptionAnalytics.categoryBreakdown).forEach(([category, amount]) => {
          doc.text(`  • ${category}: ${formatCurrency(amount)}`, margin, yPosition)
          yPosition += 7
        })
        yPosition += 15
      }
    }

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

    // Rodapé
    const currentDate = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text(`Relatório gerado em ${currentDate}`, margin, doc.internal.pageSize.height - 10)

    // Download do PDF
    doc.save(`relatorio-financeiro-${selectedPeriod}-${currentDate.replace(/\//g, '-')}.pdf`)
  }

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
        setAlertHandlers: setAlertHandlersFunc
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export { ReportsContext }
