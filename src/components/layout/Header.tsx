import { Group, Button, Image, Box } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import logoColor from '../../assets/images/logo_color.png'

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const handleLogout = () => {
    onLogout()
    notifications.show({
      title: 'Logout realizado!',
      message: 'Até logo!',
      color: 'green',
    })
  }

  return (
    <Group justify="space-between" mb="xl" py="md">
      <Box>
        <Image
          src={logoColor}
          alt="Smart Gastos"
          h={60}
          fit="contain"
        />
      </Box>
      <Button
        variant="outline"
        onClick={handleLogout}
        color="#0ca167"
      >
        Sair
      </Button>
    </Group>
  )
}
