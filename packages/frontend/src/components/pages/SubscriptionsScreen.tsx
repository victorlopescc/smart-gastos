import { Container, Title, Text, Card, Grid, Badge, Group, Button, Modal, TextInput, Select } from '@mantine/core'
import { IconPlus, IconPencil } from '@tabler/icons-react'
import { useState } from 'react'
import { useSubscriptions } from '../../hooks/useSubscriptions.ts'
import type { Subscription } from '../../types'

type SubscriptionStatus = 'Ativa' | 'Pendente' | 'Cancelada'

interface FormData {
  name: string
  category: string
  amount: string
  nextPayment: string
  status: SubscriptionStatus
}

export function SubscriptionsScreen() {
  const { subscriptions, addSubscription, updateSubscription, toggleSubscriptionStatus } = useSubscriptions()
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  
  const [addFormData, setAddFormData] = useState<FormData>({
    name: '',
    category: '',
    amount: '',
    nextPayment: new Date().toISOString().split('T')[0],
    status: 'Ativa'
  })

  const [editFormData, setEditFormData] = useState<FormData>({
    name: '',
    category: '',
    amount: '',
    nextPayment: '',
    status: 'Ativa'
  })

  const categories = [
    'Entretenimento',
    'Tecnologia', 
    'Trabalho',
    'Saúde',
    'Educação',
    'Serviços',
    'Outros'
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalActive = subscriptions
    .filter(sub => sub.status === 'Ativa')
    .reduce((sum, sub) => sum + sub.amount, 0)

  const handleAddSubscription = () => {
    const amountValue = addFormData.amount.replace(/\D/g, '')
    const amount = amountValue ? parseInt(amountValue) / 100 : 0

    if (addFormData.name && addFormData.category && amount > 0) {
      addSubscription({
        name: addFormData.name,
        category: addFormData.category,
        amount: amount,
        nextPayment: addFormData.nextPayment,
        status: addFormData.status
      })

      setAddFormData({
        name: '',
        category: '',
        amount: '',
        nextPayment: new Date().toISOString().split('T')[0],
        status: 'Ativa'
      })
      setAddModalOpened(false)
    }
  }

  const handleEditSubscription = () => {
    if (!editingSubscription) return

    const amountValue = editFormData.amount.replace(/\D/g, '')
    const amount = amountValue ? parseInt(amountValue) / 100 : 0

    if (editFormData.name && editFormData.category && amount > 0) {
      updateSubscription(editingSubscription.id, {
        name: editFormData.name,
        category: editFormData.category,
        amount: amount,
        nextPayment: editFormData.nextPayment,
        status: editFormData.status
      })

      setEditModalOpened(false)
      setEditingSubscription(null)
    }
  }

  const handleOpenEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setEditFormData({
      name: subscription.name,
      category: subscription.category,
      amount: subscription.amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      nextPayment: subscription.nextPayment,
      status: subscription.status
    })
    setEditModalOpened(true)
  }

  const handleAmountChange = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<FormData>>
  ) => {
    const cleanValue = value.replace(/\D/g, '')

    if (cleanValue) {
      const numericValue = parseInt(cleanValue) / 100
      const formattedValue = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      
      setter((prev: FormData) => ({ ...prev, amount: formattedValue }))
    } else {
      setter((prev: FormData) => ({ ...prev, amount: '' }))
    }
  }

  return (
    <>
      <Container size="lg" py="xl">
        <Title order={2} mb="lg">Assinaturas</Title>

        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">Total mensal em assinaturas ativas</Text>
              <Text size="xl" fw={700} c="#0ca167">{formatCurrency(totalActive)}</Text>
            </div>
            <Button 
              color="#0ca167" 
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddModalOpened(true)}
            >
              Adicionar Assinatura
            </Button>
          </Group>
        </Card>

        <Grid>
          {subscriptions.map(subscription => (
            <Grid.Col key={subscription.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{subscription.name}</Text>
                  <Badge color={
                    subscription.status === 'Ativa' ? 'green' : 
                    subscription.status === 'Pendente' ? 'yellow' : 'red'
                  }>
                    {subscription.status}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="xs">
                  {subscription.category}
                </Text>
                <Text size="lg" fw={700} c="#0ca167" mb="xs">
                  {formatCurrency(subscription.amount)}
                </Text>
                <Text size="sm" c="dimmed">
                  Próximo vencimento: {new Date(subscription.nextPayment).toLocaleDateString('pt-BR')}
                </Text>
                <Group mt="md">
                  <Button 
                    variant="light" 
                    size="xs" 
                    color="#0ca167"
                    leftSection={<IconPencil size={12} />}
                    onClick={() => handleOpenEditModal(subscription)}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="light" 
                    color={subscription.status === 'Ativa' ? 'red' : 'yellow'}
                    size="xs"
                    onClick={() => toggleSubscriptionStatus(subscription.id)}
                  >
                    {subscription.status === 'Ativa' ? 'Cancelar' : 'Reativar'}
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Modal para adicionar assinatura */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title="Adicionar Nova Assinatura"
        size="md"
        centered
      >
        <TextInput
          label="Nome da assinatura"
          placeholder="Ex: Netflix, Spotify, Adobe..."
          value={addFormData.name}
          onChange={(e) => setAddFormData(prev => ({ ...prev, name: e.target.value }))}
          mb="md"
          required
        />

        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categories}
          value={addFormData.category}
          onChange={(value) => setAddFormData(prev => ({ ...prev, category: value || '' }))}
          mb="md"
          required
        />

        <TextInput
          label="Valor mensal"
          placeholder="0,00"
          value={addFormData.amount}
          onChange={(e) => handleAmountChange(e.target.value, setAddFormData)}
          type="text"
          mb="md"
          required
        />

        <TextInput
          label="Próximo vencimento"
          type="date"
          value={addFormData.nextPayment}
          onChange={(e) => setAddFormData(prev => ({ ...prev, nextPayment: e.target.value }))}
          mb="md"
          required
        />

        <Select
          label="Status"
          data={['Ativa', 'Pendente', 'Cancelada']}
          value={addFormData.status}
          onChange={(value) => setAddFormData(prev => ({ ...prev, status: (value as SubscriptionStatus) || 'Ativa' }))}
          mb="md"
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setAddModalOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={handleAddSubscription} color="#0ca167">
            Adicionar Assinatura
          </Button>
        </Group>
      </Modal>

      {/* Modal para editar assinatura */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Editar Assinatura"
        size="md"
        centered
      >
        <TextInput
          label="Nome da assinatura"
          placeholder="Ex: Netflix, Spotify, Adobe..."
          value={editFormData.name}
          onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
          mb="md"
          required
        />

        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          data={categories}
          value={editFormData.category}
          onChange={(value) => setEditFormData(prev => ({ ...prev, category: value || '' }))}
          mb="md"
          required
        />

        <TextInput
          label="Valor mensal"
          placeholder="0,00"
          value={editFormData.amount}
          onChange={(e) => handleAmountChange(e.target.value, setEditFormData)}
          type="text"
          mb="md"
          required
        />

        <TextInput
          label="Próximo vencimento"
          type="date"
          value={editFormData.nextPayment}
          onChange={(e) => setEditFormData(prev => ({ ...prev, nextPayment: e.target.value }))}
          mb="md"
          required
        />

        <Select
          label="Status"
          data={['Ativa', 'Pendente', 'Cancelada']}
          value={editFormData.status}
          onChange={(value) => setEditFormData(prev => ({ ...prev, status: (value as SubscriptionStatus) || 'Ativa' }))}
          mb="md"
        />

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setEditModalOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={handleEditSubscription} color="#0ca167">
            Salvar Alterações
          </Button>
        </Group>
      </Modal>
    </>
  )
}
