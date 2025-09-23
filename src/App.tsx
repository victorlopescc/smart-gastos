import { useState } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuth } from './hooks/useAuth'
import { IntegratedProvider } from './contexts/IntegratedProvider'
import { LoginScreen } from './components/auth/LoginScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardScreen } from './components/pages/DashboardScreen'
import { SubscriptionsScreen } from './components/pages/SubscriptionsScreen'
import { AlertsScreen } from './components/pages/AlertsScreen'
import { ReportsScreen } from './components/pages/ReportsScreen'
import { ExpenseHistoryScreen } from './components/pages/ExpenseHistoryScreen'
import { ProfileScreen } from './components/pages/ProfileScreen'
import { Loader, Center } from '@mantine/core'

type AuthView = 'login' | 'register'
type Screen = 'dashboard' | 'subscriptions' | 'alerts' | 'reports' | 'expense-history' | 'profile'

function AuthWrapper() {
  const [currentView, setCurrentView] = useState<AuthView>('login')
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" color="#0ca167" />
      </Center>
    )
  }

  if (isAuthenticated) {
    return <AuthenticatedApp />
  }

  return (
    <>
      {currentView === 'login' && (
        <LoginScreen
          onSwitchToRegister={() => setCurrentView('register')}
        />
      )}
      {currentView === 'register' && (
        <RegisterScreen
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
    </>
  )
}

function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<Screen>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardScreen />
      case 'subscriptions':
        return <SubscriptionsScreen />
      case 'alerts':
        return <AlertsScreen />
      case 'reports':
        return <ReportsScreen />
      case 'expense-history':
        return <ExpenseHistoryScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <DashboardScreen />
    }
  }

  return (
    <IntegratedProvider>
      <AppLayout
        currentPage={currentPage}
        onNavigate={(page: string) => setCurrentPage(page as Screen)}
      >
        {renderPage()}
      </AppLayout>
    </IntegratedProvider>
  )
}

function AppContent() {
  return (
    <>
      <Notifications position="bottom-right" />
      <AuthWrapper />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <MantineProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </MantineProvider>
    </AuthProvider>
  )
}

export default App
