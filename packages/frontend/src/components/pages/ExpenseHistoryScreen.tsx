import { useState, useMemo, useEffect } from 'react'
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
import { useMediaQuery } from '@mantine/hooks'
import { IconSearch, IconFilter, IconEdit, IconTrash } from '@tabler/icons-react'
import { useDashboard } from '../../hooks/useDashboard.ts'
import { useReports } from '../../hooks/useReports.ts'
import { useAlerts } from '../../hooks/useAlerts.ts'
import { useAuth } from '../../hooks/useAuth.ts'
import { useTheme } from '../../hooks/useTheme.ts'
import { categories as categoryColors, recentExpenses, historicalExpenses } from '../../data/mockData.ts'
import { createAmountChangeHandler, parseCurrencyToNumber, formatCurrency } from '../../utils/formatters.ts'
import type { Expense } from '../../types'
import { useHistory } from '../../hooks/useHistory'

// Extendendo o tipo Expense para incluir propriedades de identificação
interface ExtendedExpense extends Expense {
  isSubscription?: boolean
  isHistorical?: boolean
  isEditable?: boolean
}

export function ExpenseHistoryScreen() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { addedExpenses, editExpense, deleteExpense, getSubscriptionExpenses, monthlyData } = useDashboard()
  const { setDashboardData, setExpenses } = useReports()
  const { processExpenseAlerts } = useAlerts()

  // Hook de histórico integrado com API (para dados reais quando disponível)
  const { expenses: apiExpenses, loading: apiLoading } = useHistory()

  // Estado para armazenar as despesas de assinaturas
  const [subscriptionExpenses, setSubscriptionExpenses] = useState<Expense[]>([])

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

  const getCategoryColor = (categoryName: string) => {
    const category = categoryColors.find(cat => cat.name === categoryName)
    return category ? category.color : '#868E96'
  }

  // Carregar despesas de assinaturas quando o componente monta
  useEffect(() => {
    const loadSubscriptionExpenses = async () => {
      try {
        const expenses = await getSubscriptionExpenses()
        setSubscriptionExpenses(expenses)
      } catch (error) {
        console.error('Erro ao carregar despesas de assinaturas:', error)
        setSubscriptionExpenses([])
      }
    }

    loadSubscriptionExpenses()
  }, [getSubscriptionExpenses])

  // Integração automática com Reports e Alerts (invisível ao usuário)
  useEffect(() => {
    // Sincronizar dados do dashboard com reports
    if (monthlyData) {
      setDashboardData(monthlyData)
    }
  }, [monthlyData, setDashboardData])

  // Sincronizar gastos com reports
  useEffect(() => {
    // Combinar gastos manuais com gastos de assinaturas para relatórios completos
    const allExpenses = [...addedExpenses, ...subscriptionExpenses]
    setExpenses(allExpenses)
  }, [addedExpenses, subscriptionExpenses, setExpenses])

  // Processar alertas quando gastos mudam
  useEffect(() => {
    if (addedExpenses.length > 0 && monthlyData) {
      processExpenseAlerts(addedExpenses, monthlyData)
    }
  }, [addedExpenses, monthlyData, processExpenseAlerts])

  // Função para obter histórico completo (gastos manuais + assinaturas + histórico + API)
  const getCompleteExpenseHistory = useMemo((): ExtendedExpense[] => {
    // Usar dados da API se disponíveis, senão usar dados mock para conta de teste
    let baseExpenses = []
    if (apiExpenses && apiExpenses.length > 0) {
      // Dados reais da API
      baseExpenses = apiExpenses
    } else {
      // Apenas incluir dados históricos se for a conta de teste
      const historicalData = user?.email === 'teste@exemplo.com' ? [...historicalExpenses, ...recentExpenses] : []
      baseExpenses = historicalData
    }

    // Combinar todos os gastos: adicionados pelo usuário + assinaturas + dados base
    const allExpenses = [...addedExpenses, ...subscriptionExpenses, ...baseExpenses]

    // Adicionar flag para identificar origem (sem alterar visual)
    return allExpenses.map(expense => ({
      ...expense,
      isSubscription: expense.id > 100000 && expense.description.includes('Assinatura'),
      isHistorical: expense.id >= 101 && expense.id <= 305, // IDs históricos
      isEditable: expense.id < 100000 || addedExpenses.some(e => e.id === expense.id) // Apenas gastos adicionados manualmente são editáveis
    }))
  }, [addedExpenses, subscriptionExpenses, user, apiExpenses])

  // Atualizar filteredExpenses para usar histórico completo quando não há filtros específicos
  const filteredExpenses = useMemo((): ExtendedExpense[] => {
    // Se há filtros específicos, usar apenas gastos manuais para edição/exclusão
    // Se não há filtros, mostrar histórico completo (incluindo assinaturas)
    const baseExpenses = (searchTerm || categoryFilter || startDate || endDate)
      ? addedExpenses || []
      : getCompleteExpenseHistory

    let expenses: ExtendedExpense[] = Array.isArray(baseExpenses) ? baseExpenses : []

    // Filtro por termo de busca (descrição)
    if (searchTerm) {
      expenses = expenses.filter((expense: ExtendedExpense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por categoria
    if (categoryFilter) {
      expenses = expenses.filter((expense: ExtendedExpense) => expense.category === categoryFilter)
    }

    // Filtro por intervalo de datas
    if (startDate || endDate) {
      expenses = expenses.filter((expense: ExtendedExpense) => {
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
    return expenses.sort((a: ExtendedExpense, b: ExtendedExpense) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [addedExpenses, getCompleteExpenseHistory, searchTerm, categoryFilter, startDate, endDate])

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
      }
    }
  }

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setDeleteOpened(true)
  }

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id)
      setDeleteOpened(false)
      setExpenseToDelete(null)
    }
  }

  return (
    <Stack gap="md">
      {/* Cabeçalho */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          Histórico de Gastos
        </Text>
      </Group>

      {/* Filtros */}
      <Card padding="md">
        <Text size="lg" fw={600} mb="md">
          <IconFilter size={20} style={{ marginRight: 8 }} />
          Filtros
        </Text>

        <Group grow mb="md">
          <TextInput
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSection={<IconSearch size={16} />}
          />

          <Select
            placeholder="Filtrar por categoria"
            value={categoryFilter}
            onChange={setCategoryFilter}
            data={[
              { value: 'all', label: 'Todas as categorias' },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
            clearable
          />
        </Group>

        <Group grow mb="md">
          <TextInput
            type="date"
            label="Data início"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <TextInput
            type="date"
            label="Data fim"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Group>

        <Group>
          <Button onClick={clearFilters} variant="light">
            Limpar Filtros
          </Button>
        </Group>
      </Card>

      {/* Tabela de gastos */}
      <Card padding="md">
        <Text size="lg" fw={600} mb="md">
          Gastos ({filteredExpenses.length} encontrados)
        </Text>

        <ScrollArea>
          <Table striped highlightOnHover>
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
                filteredExpenses.map((expense, index) => {
                  const uniqueKey = `${expense.id}-${index}-${expense.date}`
                  const isEditable = expense.isEditable !== false && !expense.isSubscription

                  return (
                    <Table.Tr key={uniqueKey}>
                      <Table.Td>
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </Table.Td>
                      <Table.Td>
                        {expense.description}
                        {expense.isSubscription && (
                          <Badge size="xs" color="blue" ml="xs">
                            Assinatura
                          </Badge>
                        )}
                        {expense.isHistorical && (
                          <Badge size="xs" color="gray" ml="xs">
                            Histórico
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          style={{ backgroundColor: getCategoryColor(expense.category) }}
                          variant="filled"
                        >
                          {expense.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} c="red">
                          {formatCurrency(expense.amount)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {isEditable && (
                            <>
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => handleEditExpense(expense)}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleDeleteExpense(expense)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                })
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

      {/* Modal de edição */}
      <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title="Editar Despesa"
      >
        <Stack>
          <TextInput
            label="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <Select
            label="Categoria"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value || '' })}
            data={categories}
            required
          />

          <TextInput
            label="Valor (R$)"
            value={formData.amount}
            onChange={createAmountChangeHandler(setFormData)}
            placeholder="0,00"
            required
          />

          <TextInput
            type="date"
            label="Data"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Group justify="end">
            <Button variant="light" onClick={() => setEditOpened(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title="Confirmar Exclusão"
      >
        <Stack>
          <Text>
            Tem certeza que deseja excluir a despesa "{expenseToDelete?.description}"?
          </Text>
          <Text size="sm" c="dimmed">
            Esta ação não pode ser desfeita.
          </Text>

          <Group justify="end">
            <Button variant="light" onClick={() => setDeleteOpened(false)}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
