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
  Anchor,
  Divider,
  Box,
  Image
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useTheme } from '../../hooks/useTheme'
import logoColor from '../../assets/images/logo_color.png'
import logoWhite from '../../assets/images/logo_white.png'

interface LoginScreenProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

export function LoginScreen({ onLogin, onGoToRegister }: LoginScreenProps) {
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) => (value.length < 6 ? 'Senha deve ter pelo menos 6 caracteres' : null),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)

    // Simular uma chamada de API
    setTimeout(() => {
      setLoading(false)
      notifications.show({
        title: 'Login realizado!',
        message: `Bem-vindo ao Smart Gastos, ${values.email}!`,
        color: 'green',
      })
      onLogin()
    }, 1500)
  }

  return (
    <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Box w="100%">
        <Paper radius="md" p="xl" withBorder>
          <Box ta="center">
            <Image
              src={isDark ? logoWhite : logoColor}
              alt="Smart Gastos"
              h={140}
              fit="contain"
              mx="auto"
            />
          </Box>

          <Text size="sm" c="dimmed" ta="center" mb="xl">
            Organize suas finanças de forma inteligente
          </Text>

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

              <Group justify="space-between" mt="xs">
                <Anchor component="button" size="sm" type="button">
                  Esqueceu a senha?
                </Anchor>
              </Group>

              <Button 
                type="submit" 
                fullWidth 
                mt="xl" 
                loading={loading}
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
              onClick={onGoToRegister}
            >
              Criar conta
            </Button>
          </Group>
        </Paper>
      </Box>
    </Container>
  )
}
