import { useState } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ThemeProvider } from './contexts/ThemeContext'
import { SubscriptionsProvider } from './contexts/SubscriptionsContext'
import { AlertsProvider } from './contexts/AlertsContext'
import { ReportsProvider } from './contexts/ReportsContext'
import { DashboardProvider } from './contexts/DashboardContext'
import { useTheme } from './hooks/useTheme'
import { LoginScreen } from './components/auth/LoginScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardScreen } from './components/pages/DashboardScreen'
import { SubscriptionsScreen } from './components/pages/SubscriptionsScreen'
import { AlertsScreen } from './components/pages/AlertsScreen'
import { ReportsScreen } from './components/pages/ReportsScreen'
import { ExpenseHistoryScreen } from './components/pages/ExpenseHistoryScreen'
import { ProfileScreen } from './components/pages/ProfileScreen'

type Screen = 'login' | 'register' | 'dashboard' | 'subscriptions' | 'alerts' | 'reports' | 'expense-history' | 'profile'

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const { isDark } = useTheme()

  const handleLogin = () => {
    setCurrentScreen('dashboard')
  }

  const handleRegister = () => {
    setCurrentScreen('login')
  }

  const handleLogout = () => {
    setCurrentScreen('login')
  }

  const handleGoToRegister = () => {
    setCurrentScreen('register')
  }

  const handleBackToLogin = () => {
    setCurrentScreen('login')
  }

  const handleNavigate = (page: string) => {
    setCurrentScreen(page as Screen)
  }

  const renderPageContent = () => {
    switch (currentScreen) {
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
    <MantineProvider defaultColorScheme="auto" forceColorScheme={isDark ? 'dark' : 'light'}>
      <Notifications />
      {/* Telas de autenticação (sem layout) */}
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen onRegister={handleRegister} onBackToLogin={handleBackToLogin} />
      )}

      {/* Telas principais (com layout e menu lateral) */}
      {currentScreen !== 'login' && currentScreen !== 'register' && (
        <AppLayout
          currentPage={currentScreen}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        >
          {renderPageContent()}
        </AppLayout>
      )}
    </MantineProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <SubscriptionsProvider>
          <AlertsProvider>
            <ReportsProvider>
              <AppContent />
            </ReportsProvider>
          </AlertsProvider>
        </SubscriptionsProvider>
      </DashboardProvider>
    </ThemeProvider>
  )
}

export default App
