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
    FileInput,
    Alert
} from '@mantine/core'
import {IconUser, IconSettings, IconBell, IconLock, IconDeviceFloppy, IconUpload, IconAlertCircle} from '@tabler/icons-react'
import {useState} from 'react'
import {notifications} from '@mantine/notifications'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'
import { useForm } from '@mantine/form'

export function ProfileScreen() {
    const { user, updateProfile, updatePassword, error, isLoading, clearError } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    // Form para informações pessoais
    const profileForm = useForm({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            currency: 'BRL',
            notifications: true,
        },
        validate: {
            name: (value) => value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null,
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
        },
    })

    // Form para mudança de senha
    const passwordForm = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: {
            currentPassword: (value) => value.length < 1 ? 'Senha atual é obrigatória' : null,
            newPassword: (value) => value.length < 6 ? 'Nova senha deve ter pelo menos 6 caracteres' : null,
            confirmPassword: (value, values) =>
                value !== values.newPassword ? 'Senhas não coincidem' : null,
        },
    })

    const handleAvatarUpload = async (file: File | null) => {
        if (!file) return

        setUploadingAvatar(true)
        try {
            // Simular upload de arquivo - convertendo para base64 para demonstração
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setAvatar(base64String)
                setUploadingAvatar(false)

                notifications.show({
                    title: 'Foto atualizada!',
                    message: 'Sua foto de perfil foi alterada. Salve as alterações para confirmar.',
                    color: 'blue',
                })
            }
            reader.readAsDataURL(file)
        } catch {
            setUploadingAvatar(false)
            notifications.show({
                title: 'Erro ao carregar foto',
                message: 'Não foi possível carregar a imagem. Tente novamente.',
                color: 'red',
            })
        }
    }

    const handleProfileSave = async (values: typeof profileForm.values) => {
        clearError()
        const success = await updateProfile({
            name: values.name,
            email: values.email,
            avatar: avatar || undefined
        })

        if (success) {
            notifications.show({
                title: 'Perfil atualizado!',
                message: 'Suas informações foram salvas com sucesso.',
                color: 'green',
            })
        }
    }

    const handlePasswordChange = async (values: typeof passwordForm.values) => {
        clearError()
        const success = await updatePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
        })

        if (success) {
            passwordForm.reset()
            notifications.show({
                title: 'Senha alterada!',
                message: 'Sua senha foi atualizada com sucesso.',
                color: 'green',
            })
        }
    }

    if (!user) {
        return (
            <Container size="lg" py="xl">
                <Alert
                    icon={<IconAlertCircle size="1rem" />}
                    color="red"
                    variant="light"
                >
                    Erro: Usuário não encontrado. Faça login novamente.
                </Alert>
            </Container>
        )
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
                            <Avatar
                                size={120}
                                radius="md"
                                src={avatar}
                                alt={user.name}
                            />
                            <div style={{textAlign: 'center'}}>
                                <Text fw={500} size="lg">{user.name}</Text>
                                <Text size="sm" c="dimmed">{user.email}</Text>
                                <Text size="xs" c="dimmed">
                                    Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                </Text>
                            </div>
                            <FileInput
                                placeholder={uploadingAvatar ? "Carregando..." : "Alterar foto"}
                                accept="image/*"
                                size="xs"
                                leftSection={<IconUpload size={14} />}
                                onChange={handleAvatarUpload}
                                disabled={uploadingAvatar}
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

                            {error && (
                                <Alert
                                    icon={<IconAlertCircle size="1rem" />}
                                    color="red"
                                    variant="light"
                                    mb="md"
                                >
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={profileForm.onSubmit(handleProfileSave)}>
                                <Stack>
                                    <TextInput
                                        label="Nome completo"
                                        placeholder="Seu nome completo"
                                        {...profileForm.getInputProps('name')}
                                    />
                                    <TextInput
                                        label="Email"
                                        placeholder="seu@email.com"
                                        {...profileForm.getInputProps('email')}
                                    />
                                    <Select
                                        label="Moeda padrão"
                                        data={[
                                            {value: 'BRL', label: 'Real (R$)'},
                                            {value: 'USD', label: 'Dólar ($)'},
                                            {value: 'EUR', label: 'Euro (€)'}
                                        ]}
                                        {...profileForm.getInputProps('currency')}
                                    />

                                    <Group justify="flex-end" mt="md">
                                        <Button
                                            type="submit"
                                            leftSection={<IconDeviceFloppy size={16}/>}
                                            loading={isLoading}
                                            color="#0ca167"
                                        >
                                            Salvar Informações
                                        </Button>
                                    </Group>
                                </Stack>
                            </form>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group mb="md">
                                <IconBell size={20}/>
                                <Text fw={500}>Preferências</Text>
                            </Group>
                            <Stack>
                                <Switch
                                    label="Receber notificações no app"
                                    {...profileForm.getInputProps('notifications', { type: 'checkbox' })}
                                />
                                <Switch
                                    label="Modo escuro"
                                    checked={isDark}
                                    onChange={() => toggleTheme()}
                                />
                            </Stack>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group mb="md">
                                <IconLock size={20}/>
                                <Text fw={500}>Alterar Senha</Text>
                            </Group>

                            <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
                                <Stack>
                                    <PasswordInput
                                        label="Senha atual"
                                        placeholder="Digite sua senha atual"
                                        {...passwordForm.getInputProps('currentPassword')}
                                    />
                                    <PasswordInput
                                        label="Nova senha"
                                        placeholder="Digite a nova senha"
                                        {...passwordForm.getInputProps('newPassword')}
                                    />
                                    <PasswordInput
                                        label="Confirmar nova senha"
                                        placeholder="Confirme a nova senha"
                                        {...passwordForm.getInputProps('confirmPassword')}
                                    />

                                    <Group justify="flex-end" mt="md">
                                        <Button
                                            variant="outline"
                                            color="gray"
                                            onClick={() => passwordForm.reset()}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            leftSection={<IconLock size={16}/>}
                                            loading={isLoading}
                                            color="#0ca167"
                                        >
                                            Alterar Senha
                                        </Button>
                                    </Group>
                                </Stack>
                            </form>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    )
}
