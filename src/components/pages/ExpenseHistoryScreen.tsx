import { useState, useMemo } from 'react'
import {
  Card,
  Text,
  Table,
  Badge,
  ScrollArea,
  TextInput,
  Select,
  Group,
  Button,
  Stack,
  ActionIcon,
  Modal
} from '@mantine/core'
import { IconSearch, IconFilter, IconEdit, IconTrash } from '@tabler/icons-react'
import { useDashboard } from '../../hooks/useDashboard'
import { categories as categoryColors } from '../../data/mockData'
import { createAmountChangeHandler, parseCurrencyToNumber } from '../../utils/formatters'
import type { Expense } from '../../types'

export function ExpenseHistoryScreen() {
  const { addedExpenses, editExpense, deleteExpense } = useDashboard()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editOpened, setEditOpened] = useState(false)
  const [deleteOpened, setDeleteOpened] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: ''
  })

  const categories = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Lazer',
    'Saúde',
    'Educação',
    'Vestuário',
    'Outros'
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categoryColors.find(cat => cat.name === categoryName)
    return category ? category.color : '#868E96'
  }

  // Filtrar gastos baseado nos critérios - usando TODOS os gastos adicionados pelo usuário
  const filteredExpenses = useMemo(() => {
    let expenses: Expense[] = addedExpenses || []

    // Filtro por termo de busca (descrição)
    if (searchTerm) {
      expenses = expenses.filter((expense: Expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por categoria
    if (categoryFilter) {
      expenses = expenses.filter((expense: Expense) => expense.category === categoryFilter)
    }

    // Filtro por intervalo de datas
    if (startDate || endDate) {
      expenses = expenses.filter((expense: Expense) => {
        const expenseDate = new Date(expense.date)

        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          return expenseDate >= start && expenseDate <= end
        } else if (startDate) {
          const start = new Date(startDate)
          return expenseDate >= start
        } else if (endDate) {
          const end = new Date(endDate)
          return expenseDate <= end
        }

        return true
      })
    }

    // Ordenar por data (mais recente primeiro)
    return expenses.sort((a: Expense, b: Expense) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [addedExpenses, searchTerm, categoryFilter, startDate, endDate])

  const clearFilters = () => {
    setSearchTerm('')
    setCategoryFilter(null)
    setStartDate('')
    setEndDate('')
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      date: expense.date
    })
    setEditOpened(true)
  }

  const handleSaveEdit = () => {
    if (editingExpense) {
      const amount = parseCurrencyToNumber(formData.amount)

      if (formData.description && formData.category && amount > 0) {
        editExpense(editingExpense.id, {
          description: formData.description,
          category: formData.category,
          amount: amount,
          date: formData.date
        })

        setEditOpened(false)
        setEditingExpense(null)
        setFormData({
          description: '',
          category: '',
          amount: '',
          date: ''
        })
      }
    }
  }

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteOpened(true)
  }

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id)
      setDeleteOpened(false)
      setExpenseToDelete(null)
    }
  }

  const handleAmountChange = createAmountChangeHandler(setFormData)

  const totalFilteredExpenses = filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)

  return (
    <>
      <Stack gap="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="xl" fw={600} mb="lg">Histórico de Gastos</Text>

          {/* Filtros */}
          <Card shadow="xs" padding="md" radius="md" withBorder mb="lg" style={{ backgroundColor: '#f8f9fa' }}>
            <Text size="sm" fw={500} mb="md" c="dimmed">Filtros</Text>

            <Group grow align="flex-end">
              <TextInput
                label="Buscar por descrição"
                placeholder="Digite a descrição do gasto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />

              <Select
                label="Categoria"
                placeholder="Todas as categorias"
                data={categories}
                value={categoryFilter}
                onChange={setCategoryFilter}
                clearable
                leftSection={<IconFilter size={16} />}
              />

              <TextInput
                label="Data de"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <TextInput
                label="Data até"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Button
                variant="outline"
                onClick={clearFilters}
                color="#0ca167"
              >
                Limpar Filtros
              </Button>
            </Group>
          </Card>

          {/* Resumo dos resultados */}
          <Group justify="space-between" mb="md">
            <Text size="sm" c="dimmed">
              {filteredExpenses.length} gasto(s) encontrado(s)
            </Text>
            <Text size="sm" fw={500} c="red">
              Total: {formatCurrency(totalFilteredExpenses)}
            </Text>
          </Group>

          {/* Tabela de gastos */}
          <ScrollArea type="auto">
            <Table striped highlightOnHover style={{ minWidth: 700 }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Data</Table.Th>
                  <Table.Th>Descrição</Table.Th>
                  <Table.Th>Categoria</Table.Th>
                  <Table.Th>Valor</Table.Th>
                  <Table.Th>Ações</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: Expense) => (
                    <Table.Tr key={expense.id}>
                      <Table.Td>
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {expense.description}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          size="sm"
                          style={{ backgroundColor: getCategoryColor(expense.category) + '20', color: getCategoryColor(expense.category) }}
                        >
                          {expense.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text c="red" fw={500}>
                          {formatCurrency(expense.amount)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            color="#0ca167"
                            variant="subtle"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="subtle"
                            onClick={() => handleDeleteExpense(expense)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                      <Text c="dimmed">
                        {searchTerm || categoryFilter || startDate || endDate
                          ? 'Nenhum gasto encontrado com os filtros aplicados'
                          : 'Nenhum gasto registrado ainda. Comece adicionando um gasto!'
                        }
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Card>
      </Stack>

      {/* Modal para editar gasto */}
      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title="Editar Gasto"
        size="md"
        centered
      >
        <TextInput
          label="Descrição"
          placeholder="Ex: Supermercado, Uber, Restaurante..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          mb="md"
          required
        />

        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categories}
          value={formData.category}
          onChange={(value) => setFormData(prev => ({ ...prev, category: value || '' }))}
          mb="md"
          required
        />

        <TextInput
          label="Valor"
          placeholder="0,00"
          value={formData.amount}
          onChange={handleAmountChange}
          type="text"
          mb="md"
          required
        />

        <TextInput
          label="Data"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          mb="md"
          required
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setEditOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} color="#0ca167">
            Salvar Alterações
          </Button>
        </Group>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title="Confirmar Exclusão"
        size="sm"
        centered
      >
        <Text size="sm" mb="md">
          Tem certeza que deseja excluir este gasto?
        </Text>

        {expenseToDelete && (
          <Card mb="md" p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Text size="sm" fw={500} mb="xs">
              {expenseToDelete.description}
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              {expenseToDelete.category} • {new Date(expenseToDelete.date).toLocaleDateString('pt-BR')}
            </Text>
            <Text size="sm" c="red" fw={500}>
              {formatCurrency(expenseToDelete.amount)}
            </Text>
          </Card>
        )}

        <Text size="xs" c="dimmed" mb="md">
          Esta ação não pode ser desfeita.
        </Text>

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setDeleteOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteExpense} color="red">
            Excluir Gasto
          </Button>
        </Group>
      </Modal>
    </>
  )
}
