import { Container, Title, Text, Card, Stack, Group, Alert, Button } from '@mantine/core'
import { IconAlertTriangle, IconInfoCircle, IconCheck, IconX } from '@tabler/icons-react'
import { alerts } from '../../data/mockData'

export function AlertsScreen() {
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

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>Alertas e Notificações</Title>
        <Button variant="outline" color="#0ca167">
          Marcar todos como lidos
        </Button>
      </Group>

      <Stack gap="md">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            icon={getAlertIcon(alert.type)}
            title={alert.title}
            color={getAlertColor(alert.type)}
            variant="light"
          >
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1 }}>
                <Text size="sm" mb="xs">
                  {alert.message}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(alert.date).toLocaleDateString('pt-BR')}
                </Text>
              </div>
              <Button size="xs" variant="subtle" color="#0ca167">
                Marcar como lido
              </Button>
            </Group>
          </Alert>
        ))}
      </Stack>

      {alerts.length === 0 && (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed">
            Nenhum alerta no momento. Tudo certo com suas finanças! 🎉
          </Text>
        </Card>
      )}
    </Container>
  )
}
