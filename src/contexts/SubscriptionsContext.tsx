import { createContext, useState, type ReactNode } from 'react'
import type { Subscription } from '../types'
import { subscriptions as initialSubscriptions } from '../data/mockData'

interface SubscriptionsContextType {
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  updateSubscription: (id: number, subscription: Partial<Subscription>) => void
  toggleSubscriptionStatus: (id: number) => void
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined)

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)

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
