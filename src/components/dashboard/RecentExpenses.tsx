import { Card, Text, Table, Badge, ScrollArea, Button, Modal, TextInput, Select, Group, Box } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { categories as categoryColors } from '../../data/mockData'

export function RecentExpenses() {
  const { monthlyData, addExpense } = useDashboard()
  const [opened, setOpened] = useState(false)
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
    // Remove formatação e converte para número
    const amountValue = formData.amount.replace(/\D/g, '')
    const amount = amountValue ? parseInt(amountValue) / 100 : 0

    if (formData.description && formData.category && amount > 0) {
      addExpense({
        description: formData.description,
        category: formData.category,
        amount: amount,
        date: formData.date
      })

      setFormData({
        description: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setOpened(false)
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

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target?.value || ''
    setFormData(prev => ({ ...prev, description: value }))
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target?.value || ''
    // Remove tudo que não é número
    value = value.replace(/\D/g, '')
    
    if (value) {
      // Converte para número e divide por 100 para ter os centavos
      const numericValue = parseInt(value) / 100
      
      // Formata como moeda brasileira em tempo real
      const formattedValue = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      
      setFormData(prev => ({ ...prev, amount: formattedValue }))
    } else {
      setFormData(prev => ({ ...prev, amount: '' }))
    }
  }

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
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {monthlyData.recentExpenses.map((expense) => (
                <Table.Tr key={expense.id}>
                  <Table.Td>{new Date(expense.date).toLocaleDateString('pt-BR')}</Table.Td>
                  <Table.Td>{expense.description}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm" color={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
                  </Table.Td>
                  <Table.Td c="red">{formatCurrency(expense.amount)}</Table.Td>
                </Table.Tr>
              ))}
              {monthlyData.recentExpenses.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
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
    </>
  )
}
