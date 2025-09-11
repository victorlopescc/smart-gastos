import React, { useState, useEffect, type ReactNode } from 'react'
import type {User, AuthState, LoginCredentials, RegisterData} from '../types'
import { AuthContext } from '../hooks/useAuth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  error: string | null
  clearError: () => void
}

// Simulação de banco de dados local usando localStorage
const USERS_KEY = 'financeapp_users'
const CURRENT_USER_KEY = 'financeapp_current_user'

interface StoredUser {
  id: string
  email: string
  name: string
  password: string
  createdAt: string
}

const getStoredUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(USERS_KEY)
  return stored ? JSON.parse(stored) : []
}

const saveUser = (user: StoredUser) => {
  const users = getStoredUsers()
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const findUserByEmail = (email: string): StoredUser | null => {
  const users = getStoredUsers()
  return users.find(user => user.email === email) || null
}

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Inicializar conta de teste se não existir
const initializeTestAccount = () => {
  const testEmail = 'teste@exemplo.com'
  if (!findUserByEmail(testEmail)) {
    const testUser: StoredUser = {
      id: 'test-user-1',
      email: testEmail,
      name: 'Usuário Teste',
      password: '123456',
      createdAt: new Date().toISOString()
    }
    saveUser(testUser)
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = !!user

  // Verificar se há usuário logado ao inicializar
  useEffect(() => {
    initializeTestAccount()
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))

      const storedUser = findUserByEmail(credentials.email)

      if (!storedUser) {
        setError('Email não encontrado')
        return false
      }

      if (storedUser.password !== credentials.password) {
        setError('Senha incorreta')
        return false
      }

      const userSession: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        createdAt: storedUser.createdAt
      }

      setUser(userSession)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession))
      return true

    } catch {
      setError('Erro interno. Tente novamente.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null)
    setIsLoading(true)

    try {
      // Validações
      if (data.password !== data.confirmPassword) {
        setError('As senhas não coincidem')
        return false
      }

      if (data.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres')
        return false
      }

      // Verificar se email já existe
      if (findUserByEmail(data.email)) {
        setError('Este email já está em uso')
        return false
      }

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newUser: StoredUser = {
        id: generateId(),
        email: data.email,
        name: data.name,
        password: data.password,
        createdAt: new Date().toISOString()
      }

      saveUser(newUser)

      const userSession: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }

      setUser(userSession)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession))
      return true

    } catch {
      setError('Erro interno. Tente novamente.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
