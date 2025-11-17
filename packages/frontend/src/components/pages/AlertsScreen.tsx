import { Container, Title, Text, Card, Stack, Group, Alert, Button, ActionIcon, Modal, Select, TextInput, Box } from '@mantine/core'
import { IconAlertTriangle, IconInfoCircle, IconCheck, IconX, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useAlerts } from '../../hooks/useAlerts.ts'

type AlertTypeOption = 'info' | 'warning' | 'error' | 'success'

export function AlertsScreen() {
  const { alerts, removeAlert, markAllAsRead, addAlert } = useAlerts()
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [selectedAlertTemplate, setSelectedAlertTemplate] = useState<string>('')
  const [customTitle, setCustomTitle] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const alertTemplates = [
    {
      value: 'budget-warning',
      label: 'Orçamento quase esgotado',
      type: 'warning' as AlertTypeOption,
      title: 'Orçamento quase esgotado',
      message: 'Você já gastou 85% do seu orçamento mensal'
    },
    {
      value: 'subscription-due',
      label: 'Assinatura vencendo',
      type: 'info' as AlertTypeOption,
      title: 'Assinatura vencendo',
      message: 'Netflix vence em 3 dias'
    },
    {
      value: 'goal-achieved',
      label: 'Meta atingida',
      type: 'success' as AlertTypeOption,
      title: 'Meta atingida',
      message: 'Parabéns! Você economizou R$ 300 este mês'
    },
    {
      value: 'payment-overdue',
      label: 'Pagamento em atraso',
      type: 'error' as AlertTypeOption,
      title: 'Pagamento em atraso',
      message: 'Cartão de crédito com pagamento pendente'
    },
    {
      value: 'budget-exceeded',
      label: 'Orçamento excedido',
      type: 'error' as AlertTypeOption,
      title: 'Orçamento excedido',
      message: 'Você ultrapassou seu orçamento mensal em R$ 200'
    },
    {
      value: 'custom',
      label: 'Alerta personalizado',
      type: 'info' as AlertTypeOption,
      title: '',
      message: ''
    }
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <IconAlertTriangle size={16} />
      case 'error':
        return <IconX size={16} />
      case 'success':
        return <IconCheck size={16} />
      default:
        return <IconInfoCircle size={16} />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'orange'
      case 'error':
        return 'red'
      case 'success':
        return 'green'
      default:
        return 'blue'
    }
  }

  const handleAddAlert = () => {
    const selectedTemplate = alertTemplates.find(template => template.value === selectedAlertTemplate)

    if (selectedTemplate) {
      if (selectedTemplate.value === 'custom') {
        if (customTitle && customMessage) {
          addAlert({
            type: 'info',
            title: customTitle,
            message: customMessage,
            date: new Date().toISOString().split('T')[0]
          })
        }
      } else {
        addAlert({
          type: selectedTemplate.type,
          title: selectedTemplate.title,
          message: selectedTemplate.message,
          date: new Date().toISOString().split('T')[0]
        })
      }

      setAddModalOpened(false)
      setSelectedAlertTemplate('')
      setCustomTitle('')
      setCustomMessage('')
    }
  }

  const handleTemplateChange = (value: string | null) => {
    setSelectedAlertTemplate(value || '')
    setCustomTitle('')
    setCustomMessage('')
  }

  return (
    <>
      <Container size="lg" py="xl">
        <Group justify="space-between" align="center" mb="lg">
          <Title order={2}>Alertas e Notificações</Title>
          <Button
            variant="outline"
            color="#0ca167"
            onClick={markAllAsRead}
            disabled={alerts.length === 0}
          >
            Marcar todos como lidos
          </Button>
        </Group>

        <Stack gap="md">
          {alerts.map(alert => (
            <div key={alert.id} style={{ position: 'relative' }}>
              <Alert
                icon={getAlertIcon(alert.type)}
                title={alert.title}
                color={getAlertColor(alert.type)}
                variant="light"
                style={{ paddingRight: '50px' }}
              >
                <div>
                  <Text size="sm" mb="xs">
                    {alert.message}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(alert.date).toLocaleDateString('pt-BR')}
                  </Text>
                </div>
              </Alert>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => removeAlert(alert.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  zIndex: 10
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            </div>
          ))}
        </Stack>

        {alerts.length === 0 && (
          <Text ta="center" c="dimmed" mt="xl" size="lg">
            Nenhum alerta no momento. Tudo certo com suas finanças! 🎉
          </Text>
        )}

        <Box mt="xl" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            leftSection={<IconPlus size={16} />}
            color="#0ca167"
            onClick={() => setAddModalOpened(true)}
          >
            Adicionar Alerta
          </Button>
        </Box>
      </Container>

      {/* Modal para adicionar alerta */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title="Adicionar Novo Alerta"
        size="md"
        centered
      >
        <Select
          label="Tipo de alerta"
          placeholder="Selecione um tipo de alerta"
          data={alertTemplates.map(template => ({
            value: template.value,
            label: template.label
          }))}
          value={selectedAlertTemplate}
          onChange={handleTemplateChange}
          mb="md"
          required
        />

        {selectedAlertTemplate === 'custom' && (
          <>
            <TextInput
              label="Título do alerta"
              placeholder="Digite o título do alerta"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              mb="md"
              required
            />

            <TextInput
              label="Mensagem do alerta"
              placeholder="Digite a mensagem do alerta"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              mb="md"
              required
            />
          </>
        )}

        {selectedAlertTemplate && selectedAlertTemplate !== 'custom' && (
          <Card withBorder p="sm" mb="md" bg="gray.0">
            <Text size="sm" fw={500} mb="xs">Pré-visualização:</Text>
            <Text size="sm" fw={500}>
              {alertTemplates.find(t => t.value === selectedAlertTemplate)?.title}
            </Text>
            <Text size="sm" c="dimmed">
              {alertTemplates.find(t => t.value === selectedAlertTemplate)?.message}
            </Text>
          </Card>
        )}

        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setAddModalOpened(false)} color="#0ca167">
            Cancelar
          </Button>
          <Button
            onClick={handleAddAlert}
            color="#0ca167"
            disabled={
              !selectedAlertTemplate ||
              (selectedAlertTemplate === 'custom' && (!customTitle || !customMessage))
            }
          >
            Adicionar Alerta
          </Button>
        </Group>
      </Modal>
    </>
  )
}
