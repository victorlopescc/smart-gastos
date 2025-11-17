import { Container, Title, LoadingOverlay, Alert } from '@mantine/core'
import { BudgetSummary } from '../dashboard/BudgetSummary.tsx'
import { CategoryCharts } from '../dashboard/CategoryCharts.tsx'
import { RecentExpenses } from '../dashboard/RecentExpenses.tsx'
import { useDashboard } from '../../hooks/useDashboard.ts'

export function DashboardScreen() {
  const { getCurrentMonth, isLoading, error } = useDashboard()

  return (
    <Container size="lg" py="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />

      <Title order={2} mb="lg">Resumo do Mês - {getCurrentMonth()}</Title>

      {error && (
        <Alert color="red" title="Erro" mb="lg">
          {error}
        </Alert>
      )}

      <BudgetSummary />

      <CategoryCharts />

      <RecentExpenses />
    </Container>
  )
}
