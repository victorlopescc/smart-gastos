import { Container, Title, Text, Card, Grid, Select, Button, Group } from '@mantine/core'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { IconDownload } from '@tabler/icons-react'
import { useReports } from '../../hooks/useReports'

export function ReportsScreen() {
  const { selectedPeriod, setSelectedPeriod, getFilteredReports, exportToPDF } = useReports()
  const filteredReports = getFilteredReports()

  // Dados dinâmicos baseados no filtro selecionado
  const monthlyData = filteredReports.map((report) => ({
    month: report.month.split(' ')[0].substring(0, 3),
    gastos: report.spent,
    receitas: report.budget
  })).reverse()

  // Dados de categoria do período mais recente para comparação
  const latestReport = filteredReports[0]

  // Dados para gráfico de pizza (categorias atuais)
  const categoryPieData = latestReport?.categories.filter(cat => cat.value > 0).map(category => ({
    name: category.name,
    value: category.value,
    color: category.color
  })) || []

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
