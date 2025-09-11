import { Container, Title } from '@mantine/core'
import { BudgetSummary } from '../dashboard/BudgetSummary'
import { CategoryCharts } from '../dashboard/CategoryCharts'
import { RecentExpenses } from '../dashboard/RecentExpenses'
import { monthlyData } from '../../data/mockData'

export function DashboardScreen() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Resumo do Mês - Janeiro 2025</Title>

      <BudgetSummary data={monthlyData} />

      <CategoryCharts data={monthlyData} />

      <RecentExpenses data={monthlyData} />
    </Container>
  )
}
