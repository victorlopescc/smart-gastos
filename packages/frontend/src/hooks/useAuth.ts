import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContextDefinition.tsx'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
