import { Grid, Card, Text, Progress, Badge, ActionIcon, Modal, TextInput, Button, Group } from '@mantine/core'
import { IconPencil } from '@tabler/icons-react'
import React, { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

export function BudgetSummary() {
  const { monthlyData, updateBudget } = useDashboard()
  const [opened, setOpened] = useState(false)
  const [budgetValue, setBudgetValue] = useState(monthlyData.budget.toString())

  const budgetUsedPercentage = (monthlyData.spent / monthlyData.budget) * 100
  const remaining = monthlyData.budget - monthlyData.spent

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleSaveBudget = () => {
    // Remove formatação e converte para número
    const amountValue = budgetValue.replace(/\D/g, '')
    const newBudget = amountValue ? parseInt(amountValue) / 100 : 0

    if (newBudget > 0) {
      updateBudget(newBudget)
      setOpened(false)
    }
  }

  const handleOpenModal = () => {
    // Inicializa com o valor atual já formatado
    const formattedValue = monthlyData.budget.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    setBudgetValue(formattedValue)
    setOpened(true)
  }

  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setBudgetValue(formattedValue)
    } else {
      setBudgetValue('')
    }
  }

  return (
    <>
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={120} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Group justify="space-between" align="flex-start">
              <Text size="sm" c="dimmed">Orçamento do Mês</Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={handleOpenModal}
                title="Editar orçamento"
                color="#0ca167"
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Group>
            <Text size="xl" fw={700} c="#0ca167" style={{ alignSelf: 'flex-start' }}>{formatCurrency(monthlyData.budget)}</Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={120} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Text size="sm" c="dimmed">Gasto até Agora</Text>
            <div>
              <Text size="xl" fw={700} c="red">{formatCurrency(monthlyData.spent)}</Text>
              <Progress value={budgetUsedPercentage} mt="xs" color={budgetUsedPercentage > 80 ? 'red' : '#0ca167'} />
            </div>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h={120} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Text size="sm" c="dimmed">Restante</Text>
            <div>
              {budgetUsedPercentage > 100 && (
                <Badge color="red" variant="filled" mb="xs">
                  Orçamento esgotado! Excedeu em {formatCurrency(Math.abs(remaining))}
                </Badge>
              )}
              {budgetUsedPercentage > 90 && budgetUsedPercentage <= 100 && (
                <Badge color="yellow" variant="light" mb="xs">
                  Atenção: Orçamento quase esgotado!
                </Badge>
              )}
              <Text size="xl" fw={700} c={remaining > 0 ? '#0ca167' : 'red'} style={{ alignSelf: 'flex-start' }}>
                {remaining > 0 ? formatCurrency(remaining) : formatCurrency(Math.abs(remaining))}
              </Text>
            </div>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Editar Orçamento do Mês"
        size="sm"
        centered
      >
        <TextInput
          label="Novo valor do orçamento"
          placeholder="0,00"
          value={budgetValue}
          onChange={handleBudgetChange}
          type="text"
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button onClick={handleSaveBudget} color="#0ca167">
            Salvar
          </Button>
        </Group>
      </Modal>
    </>
  )
}
