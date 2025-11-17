import { useContext } from 'react'
import { SubscriptionsContext } from '../contexts/SubscriptionsContext.tsx'

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext)
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider')
  }

  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    toggleSubscriptionStatus,
    deleteSubscription,
    isLoading,
    error
  } = context

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    toggleSubscriptionStatus,
    deleteSubscription,
    isLoading,
    error
  }
}
