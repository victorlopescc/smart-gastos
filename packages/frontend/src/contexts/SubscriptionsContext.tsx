import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Subscription } from '../types'
import { apiService, converters } from '../services/apiService'

interface SubscriptionsContextType {
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  updateSubscription: (id: number, subscription: Partial<Subscription>) => void
  toggleSubscriptionStatus: (id: number) => void
  deleteSubscription: (id: number) => void
  isLoading: boolean
  error: string | null
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined)

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar assinaturas do backend
  const loadSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiService.getAllSubscriptions()

      if (response.success && response.data) {
        const frontendSubscriptions = response.data.map(converters.backendToFrontendSubscription)
        setSubscriptions(frontendSubscriptions)
      } else {
        setError(response.error || 'Erro ao carregar assinaturas')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor')
      console.error('Erro ao carregar assinaturas:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar assinaturas quando o componente monta
  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  // Adicionar nova assinatura
  const addSubscription = useCallback(async (subscriptionData: Omit<Subscription, 'id'>) => {
    try {
      setIsLoading(true)
      const backendSubscription = converters.frontendToBackendSubscription(subscriptionData)
      const response = await apiService.addSubscription(backendSubscription)

      if (response.success) {
        // Recarregar lista de assinaturas
        await loadSubscriptions()
      } else {
        setError(response.error || 'Erro ao adicionar assinatura')
      }
    } catch (err) {
      setError('Erro de conexão ao adicionar assinatura')
      console.error('Erro ao adicionar assinatura:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadSubscriptions])

  // Atualizar assinatura
  const updateSubscription = useCallback(async (id: number, updates: Partial<Subscription>) => {
    try {
      setIsLoading(true)
      const response = await apiService.updateSubscription(id.toString(), updates)

      if (response.success) {
        // Recarregar lista de assinaturas
        await loadSubscriptions()
      } else {
        setError(response.error || 'Erro ao atualizar assinatura')
      }
    } catch (err) {
      setError('Erro de conexão ao atualizar assinatura')
      console.error('Erro ao atualizar assinatura:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadSubscriptions])

  // Alternar status da assinatura (Ativa/Cancelada)
  const toggleSubscriptionStatus = useCallback(async (id: number) => {
    const subscription = subscriptions.find(sub => sub.id === id)
    if (!subscription) return

    const newStatus = subscription.status === 'Ativa' ? 'Cancelada' : 'Ativa'
    await updateSubscription(id, { status: newStatus })
  }, [subscriptions, updateSubscription])

  // Deletar assinatura
  const deleteSubscription = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      const response = await apiService.deleteSubscription(id.toString())

      if (response.success) {
        // Recarregar lista de assinaturas
        await loadSubscriptions()
      } else {
        setError(response.error || 'Erro ao deletar assinatura')
      }
    } catch (err) {
      setError('Erro de conexão ao deletar assinatura')
      console.error('Erro ao deletar assinatura:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadSubscriptions])

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        toggleSubscriptionStatus,
        deleteSubscription,
        isLoading,
        error
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  )
}

export { SubscriptionsContext }
