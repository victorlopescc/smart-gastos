import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  Stack,
  Anchor,
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

interface LoginScreenProps {
  onSwitchToRegister: () => void
}

export function LoginScreen({ onSwitchToRegister }: LoginScreenProps) {
  const { login, error, isLoading, clearError } = useAuth()
  const { isDark } = useTheme()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) => (value.length < 1 ? 'Senha é obrigatória' : null),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    clearError()
    const success = await login(values)

    if (success) {
      notifications.show({
        title: 'Login realizado!',
        message: `Bem-vindo de volta!`,
        color: 'green',
      })
    }
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
              Bem-vindo de volta
            </Text>
            <Text size="sm" c="dimmed">
              Entre na sua conta para continuar
            </Text>
          </Box>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label="Email"
                placeholder="seu@email.com"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                required
                label="Senha"
                placeholder="Sua senha"
                {...form.getInputProps('password')}
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

              <Group justify="space-between" mt="xs">
                <Anchor component="button" size="sm" type="button">
                  Esqueceu a senha?
                </Anchor>
              </Group>

              <Button 
                type="submit" 
                fullWidth 
                mt="xl" 
                loading={isLoading}
                color="#0ca167"
              >
                Entrar
              </Button>
            </Stack>
          </form>

          <Divider label="Ou" labelPosition="center" my="lg" />

          <Group grow mb="md" mt="md">
            <Button 
              variant="default" 
              color="gray" 
              onClick={onSwitchToRegister}
            >
              Criar conta
            </Button>
          </Group>

          <Paper p="md" bg="gray.0" radius="md" mt="xl">
            <Text size="sm" c="dimmed" ta="center" mb="xs">
              Para testar, você pode usar:
            </Text>
            <Text size="xs" ta="center">
              <strong>Email:</strong> teste@exemplo.com
            </Text>
            <Text size="xs" ta="center">
              <strong>Senha:</strong> 123456
            </Text>
          </Paper>
        </Paper>
      </Box>
    </Container>
  )
}
