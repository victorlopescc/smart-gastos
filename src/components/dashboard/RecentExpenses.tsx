import { Card, Text, Table, Badge, ScrollArea } from '@mantine/core'
import type { MonthlyData } from '../../types'

interface RecentExpensesProps {
  data: MonthlyData;
}

export function RecentExpenses({ data }: RecentExpensesProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="lg" fw={500} mb="md">Gastos Recentes</Text>
      <ScrollArea type="auto">
        <Table striped highlightOnHover style={{ minWidth: 600 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Data</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>Categoria</Table.Th>
              <Table.Th>Valor</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.recentExpenses.map((expense) => (
              <Table.Tr key={expense.id}>
                <Table.Td>{new Date(expense.date).toLocaleDateString('pt-BR')}</Table.Td>
                <Table.Td>{expense.description}</Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {expense.category}
                  </Badge>
                </Table.Td>
                <Table.Td c="red">{formatCurrency(expense.amount)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  )
}
