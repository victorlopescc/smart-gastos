import React, { createContext, useEffect } from 'react'
import { useMantineColorScheme } from '@mantine/core'
import type { ThemeContextType } from '../types/theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  useEffect(() => {
    // Carregar tema salvo no localStorage na inicialização
    const saved = localStorage.getItem('theme')
    if (saved !== null) {
      try {
        const savedTheme = JSON.parse(saved)
        setColorScheme(savedTheme ? 'dark' : 'light')
      } catch {
        // Se erro, mantém tema padrão
      }
    }
  }, [setColorScheme])

  useEffect(() => {
    // Salvar tema no localStorage sempre que mudar
    try {
      localStorage.setItem('theme', JSON.stringify(isDark))
    } catch {
      // Silenciar erro de localStorage
    }
  }, [isDark])

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderInner>
      {children}
    </ThemeProviderInner>
  )
}

export { ThemeContext }
