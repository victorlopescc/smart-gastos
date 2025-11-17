import { Container, Title, Text, Card, Grid, Select, Button, Group, LoadingOverlay, Alert } from '@mantine/core'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { IconDownload, IconInfoCircle } from '@tabler/icons-react'
import { useReports } from '../../hooks/useReports.ts'
import { useReportsApi } from '../../hooks/useReportsApi.ts'
import { formatCurrency } from '../../utils/formatters.ts'
import { useState, useMemo, useEffect } from 'react'

export function ReportsScreen() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    getFilteredReports,
    exportToPDF,
    getIntegratedReportData
  } = useReports()

  // Hook da API para dados reais do backend
  const {
    reportsData,
    trendsData,
    loading,
    error,
    loadReportsData,
    loadTrends
  } = useReportsApi()

  const [currentPeriod, setCurrentPeriod] = useState<'3m' | '6m' | '1y'>('6m')

  // Usar dados da API se disponíveis, senão fallback para dados mock
  const filteredReports = getFilteredReports()
  const integratedData = getIntegratedReportData()

  // Função para obter cor da categoria (mantida igual)
  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Moradia': '#45B7D1',
      'Casa': '#45B7D1', // Alias para Moradia
      'Lazer': '#96CEB4',
      'Entretenimento': '#96CEB4', // Alias para Lazer
      'Saúde': '#FECA57',
      'Educação': '#FF9FF3',
      'Vestuário': '#54A0FF',
      'Outros': '#5F27CD',
      'Tecnologia': '#4ECDC4',
      'Trabalho': '#45B7D1'
    }
    return colors[categoryName] || '#868E96'
  }

  // Carregar dados da API quando o período mudar
  useEffect(() => {
    const monthsMap = { '3m': 3, '6m': 6, '1y': 12 }
    const months = monthsMap[currentPeriod]

    if (reportsData) {
      loadTrends({ months })
    }
  }, [currentPeriod, loadTrends, reportsData])

  // Dados dinâmicos - usar API se disponível, senão mock
  const monthlyData = useMemo(() => {
    if (trendsData && trendsData.trends.length > 0) {
      // Dados reais da API
      return trendsData.trends.map(trend => ({
        month: trend.month.split('-')[1], // Pegar apenas o mês
        gastos: trend.totalAmount,
        receitas: trend.totalAmount * 1.2 // Estimativa do orçamento baseada nos gastos
      })).reverse()
    } else {
      // Fallback para dados mock
      return filteredReports.map((report) => ({
        month: report.month.split(' ')[0].substring(0, 3),
        gastos: report.spent,
        receitas: report.budget
      })).reverse()
    }
  }, [trendsData, filteredReports])

  // Dados de categoria - usar API se disponível, senão mock
  const categoryPieData = useMemo(() => {
    if (reportsData && reportsData.categorySummary.length > 0) {
      // Dados reais da API
      return reportsData.categorySummary
        .filter(cat => cat.amount > 0)
        .map(cat => ({
          name: cat.category,
          value: cat.amount,
          color: getCategoryColor(cat.category)
        }))
    } else {
      // Fallback para dados mock
      return Object.entries(integratedData.currentMonthSummary.categoryBreakdown)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          color: getCategoryColor(name)
        }))
    }
  }, [reportsData, integratedData, getCategoryColor])

  // Cálculos de estatísticas - usar API se disponível, senão mock
  const { totalSaved, averageSpending, maxSavings } = useMemo(() => {
    if (reportsData && trendsData) {
      // Dados reais da API
      const totalSpent = reportsData.summary.totalAmount
      const avgSpending = reportsData.summary.averageAmount
      const estimatedBudget = totalSpent * 1.2 // Estimativa
      const saved = Math.max(0, estimatedBudget - totalSpent)

      return {
        totalSaved: saved,
        averageSpending: avgSpending,
        maxSavings: Math.max(...trendsData.trends.map(t => Math.max(0, (t.totalAmount * 1.2) - t.totalAmount)))
      }
    } else {
      // Fallback para dados mock
      const totalSavedMock = filteredReports.reduce((sum, report) => sum + report.saved, 0)
      const averageSpendingMock = filteredReports.length > 0
        ? filteredReports.reduce((sum, report) => sum + report.spent, 0) / filteredReports.length
        : 0
      const maxSavingsMock = filteredReports.length > 0
        ? Math.max(...filteredReports.map(r => r.saved))
        : 0

      return {
        totalSaved: totalSavedMock,
        averageSpending: averageSpendingMock,
        maxSavings: maxSavingsMock
      }
    }
  }, [reportsData, trendsData, filteredReports])

  const handlePeriodChange = (value: string | null) => {
    if (value) {
      const newPeriod = value as '3m' | '6m' | '1y'
      setSelectedPeriod(newPeriod)
      setCurrentPeriod(newPeriod)
    }
  }

  return (
    <Container size="lg" py="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />

      <Group justify="space-between" mb="lg">
        <Title order={2}>Relatórios Financeiros</Title>
        <Group>
          <Select
            placeholder="Período"
            data={[
              { value: '3m', label: 'Últimos 3 meses' },
              { value: '6m', label: 'Últimos 6 meses' },
              { value: '1y', label: 'Último ano' }
            ]}
            value={selectedPeriod}
            onChange={handlePeriodChange}
          />
          <Button
            leftSection={<IconDownload size={16} />}
            variant="outline"
            color="#0ca167"
            onClick={exportToPDF}
          >
            Exportar PDF
          </Button>
        </Group>
      </Group>

      {/* Erro */}
      {error && (
        <Alert color="red" icon={<IconInfoCircle size={16} />} mb="md">
          {error}
        </Alert>
      )}

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed" mb="xs">Economia Total</Text>
            <Text size="xl" fw={700} c="#0ca167">{formatCurrency(totalSaved)}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed" mb="xs">Gasto Médio Mensal</Text>
            <Text size="xl" fw={700} c="orange">{formatCurrency(averageSpending)}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="sm" c="dimmed" mb="xs">Maior Economia</Text>
            <Text size="xl" fw={700} c="blue">{formatCurrency(maxSavings)}</Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={12}>
          <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
            <Text size="lg" fw={500} mb="md">Evolução Mensal</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="gastos" stroke="#ff6b6b" strokeWidth={2} name="Gastos" />
                <Line type="monotone" dataKey="receitas" stroke="#0ca167" strokeWidth={2} name="Orçamento" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={500} mb="md">Gastos por Categoria</Text>
            {categoryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(Number(value))}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Text ta="center" c="dimmed" py="xl">
                Nenhum dado de categoria disponível para o período selecionado
              </Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
