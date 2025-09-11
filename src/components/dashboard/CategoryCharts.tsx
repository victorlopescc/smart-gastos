import { Grid, Card, Text, Stack, Group, Box } from '@mantine/core'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useDashboard } from '../../hooks/useDashboard'

export function CategoryCharts() {
  const { monthlyData } = useDashboard()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalSpent = monthlyData.categories.reduce((sum, cat) => sum + cat.value, 0)
  const categoriesWithData = monthlyData.categories.filter(cat => cat.value > 0)

  return (
    <Grid mb="xl">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
          <Text size="lg" fw={500} mb="md">Gastos por Categoria</Text>
          {categoriesWithData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesWithData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => `${((Number(value) / totalSpent) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesWithData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Text c="dimmed" style={{ textAlign: 'center', marginTop: '2rem' }}>
              Nenhum gasto registrado ainda
            </Text>
          )}
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder h={400}>
          <Text size="lg" fw={500} mb="md">Resumo por Categoria</Text>
          <Stack>
            {categoriesWithData.length > 0 ? (
              categoriesWithData.map((category) => (
                <Group key={category.name} justify="space-between">
                  <Group>
                    <Box
                      w={12}
                      h={12}
                      bg={category.color}
                      style={{ borderRadius: '50%' }}
                    />
                    <Text size="sm">{category.name}</Text>
                  </Group>
                  <Text size="sm" fw={500}>{formatCurrency(category.value)}</Text>
                </Group>
              ))
            ) : (
              <Text c="dimmed" style={{ textAlign: 'center', marginTop: '2rem' }}>
                Nenhum gasto por categoria ainda
              </Text>
            )}
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  )
}
