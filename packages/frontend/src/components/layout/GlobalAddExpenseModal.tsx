import { Modal, TextInput, Select, Group, Button } from '@mantine/core'
import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard.ts'
import { createAmountChangeHandler, parseCurrencyToNumber } from '../../utils/formatters.ts'

interface GlobalAddExpenseModalProps {
  opened: boolean
  onClose: () => void
}

export function GlobalAddExpenseModal({ opened, onClose }: GlobalAddExpenseModalProps) {
  const { addExpense } = useDashboard()
  
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
      onClose()
    }
  }

  const handleAmountChange = createAmountChangeHandler(setFormData)

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Adicionar Novo Gasto"
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
        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
        mb="md"
        required
      />

      <Group justify="space-between">
        <Button variant="outline" onClick={handleClose} color="#0ca167">
          Cancelar
        </Button>
        <Button onClick={handleAddExpense} color="#0ca167">
          Adicionar Gasto
        </Button>
      </Group>
    </Modal>
  )
}
