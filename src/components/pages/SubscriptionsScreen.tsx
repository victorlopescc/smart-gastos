import { Container, Title, Text, Card, Grid, Badge, Group, Button } from '@mantine/core'
import { subscriptions } from '../../data/mockData'

export function SubscriptionsScreen() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const totalActive = subscriptions
    .filter(sub => sub.status === 'Ativa')
    .reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">Assinaturas</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">Total mensal em assinaturas ativas</Text>
            <Text size="xl" fw={700} c="#0ca167">{formatCurrency(totalActive)}</Text>
          </div>
          <Button color="#0ca167">Adicionar Assinatura</Button>
        </Group>
      </Card>

      <Grid>
        {subscriptions.map(subscription => (
          <Grid.Col key={subscription.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={500}>{subscription.name}</Text>
                <Badge color={subscription.status === 'Ativa' ? 'green' : subscription.status === 'Pendente' ? 'yellow' : 'red'}>
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
                <Button variant="light" size="xs" color="#0ca167">Editar</Button>
                <Button variant="light" color="red" size="xs">
                  {subscription.status === 'Ativa' ? 'Cancelar' : 'Reativar'}
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  )
}
