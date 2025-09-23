import { Card, Text, Table, Badge, ScrollArea, Button, Modal, TextInput, Select, Group, Box, ActionIcon } from '@mantine/core'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { categories as categoryColors } from '../../data/mockData'
import { createAmountChangeHandler, parseCurrencyToNumber } from '../../utils/formatters'
import type { Expense } from '../../types'

export function RecentExpenses() {
  const { monthlyData, addExpense, editExpense, deleteExpense } = useDashboard()
  const [opened, setOpened] = useState(false)
  const [editOpened, setEditOpened] = useState(false)
  const [deleteOpened, setDeleteOpened] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
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
    return category ? category.color : '#868E96' // cor padrão se não encontrar
  }

  const handleAddExpense = () => {
    const amount = parseCurrencyToNumber(formData.amount)

    if (formData.description && formData.category && amount > 0) {
      addExpense({
        description: formData.description,
        category: formData.category,
        amount: amount,
        date: formData.date
      })

      // Reset form
      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setOpened(false)
    }
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
          date: new Date().toISOString().split('T')[0]
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

  const handleOpenModal = () => {
    setFormData({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })
    setOpened(true)
  }

  const handleOpenEditModal = (expense: Expense) => {
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

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value || ''
    setFormData(prev => ({ ...prev, description: value }))
  }

  const handleAmountChange = createAmountChangeHandler(setFormData)

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value || ''
    setFormData(prev => ({ ...prev, date: value }))
  }

  const handleCategoryChange = (value: string | null) => {
    setFormData(prev => ({ ...prev, category: value || '' }))
  }

  // Verificação de segurança para evitar erros
  if (!monthlyData || !monthlyData.recentExpenses) {
    return <div>Carregando...</div>
  }

  return (
    <>
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
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {monthlyData.recentExpenses.map((expense) => {
                // Verificar se é uma assinatura (ID > 100000 indica assinatura convertida)
                const isSubscription = expense.id > 100000 && expense.description.includes('Assinatura')

                return (
                  <Table.Tr key={expense.id}>
                    <Table.Td>{new Date(expense.date).toLocaleDateString('pt-BR')}</Table.Td>
                    <Table.Td>{expense.description}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm" color={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td c="red">{formatCurrency(expense.amount)}</Table.Td>
                    <Table.Td>
                      {!isSubscription ? (
                        <Group gap="xs">
                          <ActionIcon
                            size="sm"
                            color="#0ca167"
                            variant="subtle"
                            onClick={() => handleOpenEditModal(expense)}
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
                      ) : (
                        <Text size="xs" c="dimmed">Assinatura</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                )
              })}
              {monthlyData.recentExpenses.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">Nenhum gasto registrado este mês</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={handleOpenModal}
            size="sm"
            color="#0ca167"
          >
            Adicionar Gasto
          </Button>
        </Box>
      </Card>

      {/* Modal para adicionar novo gasto */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adicionar Novo Gasto"
        size="md"
        centered
      >
        <TextInput
          label="Descrição"
          placeholder="Ex: Supermercado, Uber, Restaurante..."
          value={formData.description}
          onChange={handleDescriptionChange}
          mb="md"
          required
        />

        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categories}
          value={formData.category}
          onChange={handleCategoryChange}
          mb="md"
          required
          searchable={false}
          allowDeselect={false}
          withCheckIcon={false}
          comboboxProps={{
            transitionProps: { duration: 0 },
            shadow: 'md',
            withinPortal: false
          }}
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
          onChange={handleDateChange}
          mb="md"
          required
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={handleAddExpense} color="#0ca167">
            Adicionar Gasto
          </Button>
        </Group>
      </Modal>

      {/* Modal para editar gasto existente */}
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
          onChange={handleDescriptionChange}
          mb="md"
          required
        />

        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categories}
          value={formData.category}
          onChange={handleCategoryChange}
          mb="md"
          required
          searchable={false}
          allowDeselect={false}
          withCheckIcon={false}
          comboboxProps={{
            transitionProps: { duration: 0 },
            shadow: 'md',
            withinPortal: false
          }}
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
          onChange={handleDateChange}
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
          <Box mb="md" p="sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <Text size="sm" fw={500} mb="xs">
              {expenseToDelete.description}
            </Text>
            <Text size="xs" c="dimmed" mb="xs">
              {expenseToDelete.category} • {new Date(expenseToDelete.date).toLocaleDateString('pt-BR')}
            </Text>
            <Text size="sm" c="red" fw={500}>
              {formatCurrency(expenseToDelete.amount)}
            </Text>
          </Box>
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
