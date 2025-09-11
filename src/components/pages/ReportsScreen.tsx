import { Container, Title, Text, Card, Grid, Select, Button, Group } from '@mantine/core'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { IconDownload } from '@tabler/icons-react'
import { monthlyReports } from '../../data/mockData'

export function ReportsScreen() {
  const monthlyData = [
    { month: 'Out', gastos: 4100, receitas: 4500 },
    { month: 'Nov', gastos: 3950, receitas: 4800 },
    { month: 'Dez', gastos: 4650, receitas: 4800 },
    { month: 'Jan', gastos: 4200, receitas: 5000 }
  ]

  const categoryComparison = [
    { category: 'Alimentação', atual: 850, anterior: 780 },
    { category: 'Transporte', atual: 550, anterior: 620 },
    { category: 'Moradia', atual: 1200, anterior: 1200 },
    { category: 'Lazer', atual: 350, anterior: 280 },
    { category: 'Saúde', atual: 200, anterior: 150 },
    { category: 'Educação', atual: 400, anterior: 350 }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalSaved = monthlyReports.reduce((sum, report) => sum + report.saved, 0)
  const averageSpending = monthlyReports.reduce((sum, report) => sum + report.spent, 0) / monthlyReports.length

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
            defaultValue="3m"
          />
          <Button
            leftSection={<IconDownload size={16} />}
            variant="outline"
            color="#0ca167"
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
            <Text size="xl" fw={700} c="blue">{formatCurrency(Math.max(...monthlyReports.map(r => r.saved)))}</Text>
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
                <Line type="monotone" dataKey="gastos" stroke="#ff6b6b" strokeWidth={2} />
                <Line type="monotone" dataKey="receitas" stroke="#0ca167" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={500} mb="md">Comparação por Categoria</Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="anterior" fill="#e9ecef" name="Mês Anterior" />
                <Bar dataKey="atual" fill="#0ca167" name="Mês Atual" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
