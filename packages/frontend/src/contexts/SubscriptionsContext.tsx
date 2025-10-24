import { createContext, useState, useEffect, type ReactNode } from 'react'
import type { Subscription } from '../types'
import { subscriptions as initialSubscriptions } from '../data/mockData.ts'
import { useAuth } from '../hooks/useAuth.ts'

interface SubscriptionsContextType {
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  updateSubscription: (id: number, subscription: Partial<Subscription>) => void
  toggleSubscriptionStatus: (id: number) => void
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined)

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  // Inicializar assinaturas baseado no usuário
  useEffect(() => {
    if (user) {
      const userSubscriptionsKey = `subscriptions_${user.id}`
      const storedSubscriptions = localStorage.getItem(userSubscriptionsKey)

      if (storedSubscriptions) {
        // Usuário existente - carregar dados salvos
        try {
          setSubscriptions(JSON.parse(storedSubscriptions))
        } catch {
          setSubscriptions([])
        }
      } else {
        // Novo usuário - verificar se é a conta de teste
        if (user.email === 'teste@exemplo.com') {
          setSubscriptions(initialSubscriptions)
          localStorage.setItem(userSubscriptionsKey, JSON.stringify(initialSubscriptions))
        } else {
          // Conta nova criada - iniciar sem assinaturas
          setSubscriptions([])
          localStorage.setItem(userSubscriptionsKey, JSON.stringify([]))
        }
      }
    }
  }, [user])

  // Salvar assinaturas no localStorage quando mudarem
  useEffect(() => {
    if (user && subscriptions.length >= 0) {
      const userSubscriptionsKey = `subscriptions_${user.id}`
      localStorage.setItem(userSubscriptionsKey, JSON.stringify(subscriptions))
    }
  }, [subscriptions, user])

  const addSubscription = (subscriptionData: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: Date.now()
    }
    setSubscriptions(prev => [newSubscription, ...prev])
  }

  const updateSubscription = (id: number, updatedData: Partial<Subscription>) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, ...updatedData } : sub
      )
    )
  }

  const toggleSubscriptionStatus = (id: number) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id
          ? {
              ...sub,
              status: sub.status === 'Ativa' ? 'Cancelada' : 'Ativa'
            }
          : sub
      )
    )
  }

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        addSubscription,
        updateSubscription,
        toggleSubscriptionStatus
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  )
}

export { SubscriptionsContext }
