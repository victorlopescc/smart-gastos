import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Stack,
  Button,
  Image,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconDashboard,
  IconCreditCard,
  IconBell,
  IconChartBar,
  IconUser,
  IconLogout,
  IconPlus,
  IconHistory,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { GlobalAddExpenseModal } from './GlobalAddExpenseModal'
import logoColor from '../../assets/images/logo_color.png'
import logoWhite from '../../assets/images/logo_white.png'
import React, { useState } from 'react'

interface AppLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure()
  const [modalOpened, setModalOpened] = useState(false)
  const { isDark } = useTheme()
  const { logout,  } = useAuth()

  const menuItems = [
    { value: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { value: 'subscriptions', label: 'Assinaturas', icon: IconCreditCard },
    { value: 'alerts', label: 'Alertas', icon: IconBell },
    { value: 'reports', label: 'Relatórios', icon: IconChartBar },
    { value: 'expense-history', label: 'Histórico', icon: IconHistory },
    { value: 'profile', label: 'Perfil', icon: IconUser }
  ]

  const handleLogout = () => {
    close() // Fechar menu antes do logout
    logout()
    notifications.show({
      title: 'Logout realizado!',
      message: 'Até logo!',
      color: 'green',
    })
  }

  const handleNavigation = (page: string) => {
    onNavigate(page)
    close()
  }

  return (
    <AppShell
      navbar={{
        width: { base: 250, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
      style={{
        '--mantine-navbar-width-base': '50vw',
        '--mantine-navbar-width-sm': '300px',
      } as React.CSSProperties}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Box>
              <Image
                src={isDark ? logoWhite : logoColor}
                alt="Smart Gastos"
                h={50}
                fit="contain"
              />
            </Box>
          </Group>

          <Group>
            <Button
              variant="filled"
              color="#0ca167"
              size="sm"
              onClick={() => setModalOpened(true)}
              leftSection={<IconPlus size="1rem" />}
              visibleFrom="sm"
            >
              Adicionar Gasto
            </Button>

            <Button
              variant="filled"
              color="#0ca167"
              size="sm"
              onClick={() => setModalOpened(true)}
              hiddenFrom="sm"
              p="xs"
            >
              <IconPlus size="1rem" />
            </Button>

            <Button
              variant="subtle"
              color="red"
              size="sm"
              onClick={handleLogout}
              leftSection={<IconLogout size="1rem" />}
              visibleFrom="sm"
            >
              Sair
            </Button>

            <Button
              variant="subtle"
              color="red"
              size="sm"
              onClick={handleLogout}
              hiddenFrom="sm"
              p="xs"
            >
              <IconLogout size="1rem" />
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <Box mb="sm">
            <Image
              src={isDark ? logoWhite : logoColor}
              alt="Smart Gastos"
              h={80}
              fit="contain"
              mx="auto"
            />
          </Box>

          <Stack gap="xs">
            {menuItems.map((item) => (
              <NavLink
                key={item.value}
                active={currentPage === item.value}
                label={item.label}
                leftSection={<item.icon size="1rem" />}
                onClick={() => handleNavigation(item.value)}
                color="#0ca167"
                variant="subtle"
              />
            ))}
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        onClick={opened ? close : undefined}
        style={opened ? { cursor: 'pointer' } : undefined}
        pt="80px"
      >
        {children}
      </AppShell.Main>

      <GlobalAddExpenseModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </AppShell>
  )
}
