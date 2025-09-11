import { createContext } from 'react'
import type { AuthState, LoginCredentials, RegisterData } from '../types'

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  error: string | null
  clearError: () => void
  updateProfile: (data: { name: string; email: string; avatar?: string }) => Promise<boolean>
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
