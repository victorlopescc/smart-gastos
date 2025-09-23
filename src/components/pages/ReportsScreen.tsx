import { Container, Title, Text, Card, Grid, Select, Button, Group } from '@mantine/core'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { IconDownload } from '@tabler/icons-react'
import { useReports } from '../../hooks/useReports'

export function ReportsScreen() {
  const {
    selectedPeriod,
    setSelectedPeriod,
    getFilteredReports,
    exportToPDF,
    getIntegratedReportData
  } = useReports()

  const filteredReports = getFilteredReports()
  const integratedData = getIntegratedReportData()

  // Função para obter cor da categoria (movida para antes do uso)
  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Alimentação': '#FF6B6B',
      'Transporte': '#4ECDC4',
      'Moradia': '#45B7D1',
      'Lazer': '#96CEB4',
      'Saúde': '#FECA57',
      'Educação': '#FF9FF3',
      'Vestuário': '#54A0FF',
      'Outros': '#5F27CD',
      'Entretenimento': '#FF6B6B',
      'Tecnologia': '#4ECDC4',
      'Trabalho': '#45B7D1'
    }
    return colors[categoryName] || '#868E96'
  }

  // Dados dinâmicos baseados no filtro selecionado
  const monthlyData = filteredReports.map((report) => ({
    month: report.month.split(' ')[0].substring(0, 3),
    gastos: report.spent,
    receitas: report.budget
  })).reverse()

  // Usar dados integrados para categoria (incluindo assinaturas)
  const categoryPieData = Object.entries(integratedData.currentMonthSummary.categoryBreakdown)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name)
    }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalSaved = filteredReports.reduce((sum, report) => sum + report.saved, 0)
  const averageSpending = filteredReports.reduce((sum, report) => sum + report.spent, 0) / filteredReports.length
  const maxSavings = Math.max(...filteredReports.map(r => r.saved))

  const handlePeriodChange = (value: string | null) => {
    if (value) {
      setSelectedPeriod(value as '3m' | '6m' | '1y')
    }
  }

  return (
    <Container size="lg" py="xl">
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
