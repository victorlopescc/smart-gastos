import { Container, Title } from '@mantine/core'
import { BudgetSummary } from '../dashboard/BudgetSummary.tsx'
import { CategoryCharts } from '../dashboard/CategoryCharts.tsx'
import { RecentExpenses } from '../dashboard/RecentExpenses.tsx'
import { useDashboard } from '../../hooks/useDashboard.ts'

export function DashboardScreen() {
  const { getCurrentMonth } = useDashboard()

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Resumo do Mês - {getCurrentMonth()}</Title>

      <BudgetSummary />

      <CategoryCharts />

      <RecentExpenses />
    </Container>
  )
}
