import { Container, Title } from '@mantine/core'
import { BudgetSummary } from '../dashboard/BudgetSummary'
import { CategoryCharts } from '../dashboard/CategoryCharts'
import { RecentExpenses } from '../dashboard/RecentExpenses'
import { DashboardProvider } from '../../contexts/DashboardContext'
import { useDashboard } from '../../hooks/useDashboard'

function DashboardContent() {
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

export function DashboardScreen() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
