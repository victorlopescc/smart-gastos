import { Grid, Card, Text, Progress, Badge } from '@mantine/core'
import type { MonthlyData } from '../../types'

interface BudgetSummaryProps {
  data: MonthlyData;
}

export function BudgetSummary({ data }: BudgetSummaryProps) {
  const budgetUsedPercentage = (data.spent / data.budget) * 100
  const remaining = data.budget - data.spent

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Grid mb="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">Orçamento do Mês</Text>
          <Text size="xl" fw={700} c="#0ca167">{formatCurrency(data.budget)}</Text>
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">Gasto até Agora</Text>
          <Text size="xl" fw={700} c="red">{formatCurrency(data.spent)}</Text>
          <Progress value={budgetUsedPercentage} mt="xs" color={budgetUsedPercentage > 80 ? 'red' : '#0ca167'} />
        </Card>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed" mb="xs">Restante</Text>
          <Text size="xl" fw={700} c={remaining > 0 ? '#0ca167' : 'red'}>
            {formatCurrency(remaining)}
          </Text>
          {budgetUsedPercentage > 90 && (
            <Badge color="red" variant="light" mt="xs">
              Atenção: Orçamento quase esgotado!
            </Badge>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  )
}
