import {
    Container,
    Title,
    Text,
    Card,
    Grid,
    TextInput,
    PasswordInput,
    Button,
    Group,
    Stack,
    Switch,
    Select,
    Avatar,
    FileInput
} from '@mantine/core'
import {IconUser, IconSettings, IconBell, IconLock, IconDeviceFloppy} from '@tabler/icons-react'
import {useState} from 'react'
import {notifications} from '@mantine/notifications'
import {userData} from '../../data/mockData'

export function ProfileScreen() {
    const [loading, setLoading] = useState(false)
    const [notifications_enabled, setNotificationsEnabled] = useState(userData.preferences.notifications)
    const [email_alerts, setEmailAlerts] = useState(false)
    const [darkMode, setDarkMode] = useState(userData.preferences.darkMode)

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            notifications.show({
                title: 'Configurações salvas!',
                message: 'Suas alterações foram aplicadas com sucesso.',
                color: 'green',
            })
        }, 1000)
    }

    return (
        <Container size="lg" py="xl">
            <Group mb="lg">
                <IconUser size={28}/>
                <Title order={2}>Perfil e Configurações</Title>
            </Group>

            <Grid>
                <Grid.Col span={{base: 12, md: 4}}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack align="center">
                            <Avatar size={120} radius="md"/>
                            <div style={{textAlign: 'center'}}>
                                <Text fw={500} size="lg">{userData.name}</Text>
                                <Text size="sm" c="dimmed">{userData.email}</Text>
                                <Text size="xs" c="dimmed">Membro
                                    desde {new Date(userData.memberSince).toLocaleDateString('pt-BR')}</Text>
                            </div>
                            <FileInput
                                placeholder="Alterar foto"
                                accept="image/*"
                                size="xs"
                            />
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{base: 12, md: 8}}>
                    <Stack>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group mb="md">
                                <IconSettings size={20}/>
                                <Text fw={500}>Informações Pessoais</Text>
                            </Group>
                            <Stack>
                                <TextInput
                                    label="Nome completo"
                                    defaultValue={userData.name}
                                />
                                <TextInput
                                    label="Email"
                                    defaultValue={userData.email}
                                />
                                <Select
                                    label="Moeda padrão"
                                    data={[
                                        {value: 'BRL', label: 'Real (R$)'},
                                        {value: 'USD', label: 'Dólar ($)'},
                                        {value: 'EUR', label: 'Euro (€)'}
                                    ]}
                                    defaultValue={userData.preferences.currency}
                                />
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group mb="md">
                                <IconBell size={20}/>
                                <Text fw={500}>Notificações</Text>
                            </Group>
                            <Stack>
                                <Switch
                                    label="Receber notificações no app"
                                    checked={notifications_enabled}
                                    onChange={(event) => setNotificationsEnabled(event.currentTarget.checked)}
                                />
                                <Switch
                                    label="Alertas por email"
                                    checked={email_alerts}
                                    onChange={(event) => setEmailAlerts(event.currentTarget.checked)}
                                />
                                <Switch
                                    label="Modo escuro"
                                    checked={darkMode}
                                    onChange={(event) => setDarkMode(event.currentTarget.checked)}
                                />
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group mb="md">
                                <IconLock size={20}/>
                                <Text fw={500}>Segurança</Text>
                            </Group>
                            <Stack>
                                <PasswordInput
                                    label="Senha atual"
                                    placeholder="Digite sua senha atual"
                                />
                                <PasswordInput
                                    label="Nova senha"
                                    placeholder="Digite a nova senha"
                                />
                                <PasswordInput
                                    label="Confirmar nova senha"
                                    placeholder="Confirme a nova senha"
                                />
                            </Stack>
                        </Card>

                        <Group justify="flex-end">
                            <Button
                                variant="outline"
                                color="gray"
                            >
                                Cancelar
                            </Button>
                            <Button
                                leftSection={<IconDeviceFloppy size={16}/>}
                                loading={loading}
                                onClick={handleSave}
                                color="#0ca167"
                            >
                                Salvar Alterações
                            </Button>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    )
}
