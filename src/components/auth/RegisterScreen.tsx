import { useState } from 'react'
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Text,
  Divider,
  Box,
  Image
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useTheme } from '../../hooks/useTheme'
import logoColor from '../../assets/images/logo_color.png'
import logoWhite from '../../assets/images/logo_white.png'

interface RegisterScreenProps {
  onRegister: () => void;
  onBackToLogin: () => void;
}

export function RegisterScreen({ onRegister, onBackToLogin }: RegisterScreenProps) {
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()

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

  const handleSubmit = async () => {
    setLoading(true)

    // Simula um cadastro
    setTimeout(() => {
      setLoading(false)
      notifications.show({
        title: 'Cadastro realizado!',
        message: 'Bem-vindo ao Smart Gastos!',
        color: 'green',
      })
      onRegister()
    }, 1000)
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
                placeholder="Sua senha"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                required
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                {...form.getInputProps('confirmPassword')}
              />

              <Button
                type="submit"
                fullWidth
                mt="xl"
                loading={loading}
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
              onClick={onBackToLogin}
            >
              Já tem uma conta? Fazer login
            </Button>
          </Group>
        </Paper>
      </Box>
    </Container>
  )
}
