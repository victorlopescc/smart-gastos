import { useState } from 'react'
import { LoginScreen } from './components/auth/LoginScreen'
import { RegisterScreen } from './components/auth/RegisterScreen'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardScreen } from './components/pages/DashboardScreen'
import { SubscriptionsScreen } from './components/pages/SubscriptionsScreen'
import { AlertsScreen } from './components/pages/AlertsScreen'
import { ReportsScreen } from './components/pages/ReportsScreen'
import { ProfileScreen } from './components/pages/ProfileScreen'

type Screen = 'login' | 'register' | 'dashboard' | 'subscriptions' | 'alerts' | 'reports' | 'profile'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')

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
      case 'profile':
        return <ProfileScreen />
      default:
        return <DashboardScreen />
    }
  }

  // Telas de autenticação (sem layout)
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} onGoToRegister={handleGoToRegister} />
  }

  if (currentScreen === 'register') {
    return <RegisterScreen onRegister={handleRegister} onBackToLogin={handleBackToLogin} />
  }

  // Telas principais (com layout e menu lateral)
  return (
    <AppLayout
      currentPage={currentScreen}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPageContent()}
    </AppLayout>
  )
}

export default App
