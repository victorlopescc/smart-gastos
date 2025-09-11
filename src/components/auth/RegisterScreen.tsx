import { useState } from 'react'
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  Stack,
  Divider,
  Box,
  Image,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import logoColor from '../../assets/images/logo_color.png'
import logoWhite from '../../assets/images/logo_white.png'

interface RegisterScreenProps {
  onSwitchToLogin: () => void
}

export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const { register, error, isLoading, clearError } = useAuth()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },

    validate: {
      name: (value) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) => (value.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'As senhas não coincidem' : null,
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    clearError()
    const success = await register(values)

    if (success) {
      notifications.show({
        title: 'Cadastro realizado!',
        message: 'Bem-vindo ao Smart Gastos!',
        color: 'green',
      })
    }

    setLoading(false)
  }

  return (
    <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box w="100%">
        <Paper radius="md" p="xl" withBorder>
          <Box ta="center" mb="xl">
            <Image
              src={isDark ? logoWhite : logoColor}
              alt="Smart Gastos"
              h={120}
              fit="contain"
              mx="auto"
              mb="md"
            />
            <Text size="lg" fw={500} mb="xs">
              Criar conta
            </Text>
            <Text size="sm" c="dimmed">
              Junte-se a nós e comece a organizar suas finanças
            </Text>
          </Box>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label="Nome completo"
                placeholder="Seu nome"
                {...form.getInputProps('name')}
              />

              <TextInput
                required
                label="Email"
                placeholder="seu@email.com"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                required
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                required
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                {...form.getInputProps('confirmPassword')}
              />

              {error && (
                <Alert
                  icon={<IconAlertCircle size="1rem" />}
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                mt="xl"
                loading={isLoading || loading}
                color="#0ca167"
              >
                Criar conta
              </Button>
            </Stack>
          </form>

          <Divider label="Ou" labelPosition="center" my="lg" />

          <Group grow mb="md" mt="md">
            <Button
              variant="default"
              color="gray"
              onClick={onSwitchToLogin}
            >
              Já tem conta? Fazer login
            </Button>
          </Group>

          <Text size="xs" c="dimmed" ta="center" mt="md">
            Ao criar uma conta, você concorda com nossos{' '}
            <Text component="span" c="blue" style={{ cursor: 'pointer' }}>
              Termos de Uso
            </Text>{' '}
            e{' '}
            <Text component="span" c="blue" style={{ cursor: 'pointer' }}>
              Política de Privacidade
            </Text>
          </Text>
        </Paper>
      </Box>
    </Container>
  )
}
