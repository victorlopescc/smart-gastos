import { createContext, useState, type ReactNode } from 'react'
import { monthlyReports } from '../data/mockData'
import jsPDF from 'jspdf'

export type PeriodFilter = '3m' | '6m' | '1y'

interface ReportsContextType {
  selectedPeriod: PeriodFilter
  setSelectedPeriod: (period: PeriodFilter) => void
  getFilteredReports: () => typeof monthlyReports
  exportToPDF: () => void
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('3m')

  const getFilteredReports = () => {
    const months = {
      '3m': 3,
      '6m': 6,
      '1y': 12
    }

    return monthlyReports.slice(0, months[selectedPeriod])
  }

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
    const doc = new jsPDF()

    // Configurações
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = 30

    // Título do relatório
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Período: ${getPeriodLabel(selectedPeriod)}`, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 20

    // Cálculos dos dados
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

  return (
    <ReportsContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        getFilteredReports,
        exportToPDF
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export { ReportsContext }
