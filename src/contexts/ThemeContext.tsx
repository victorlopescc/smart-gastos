import React, { createContext, useState, useEffect } from 'react'
import type { ThemeContextType } from '../types/theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved !== null) {
      try {
        return JSON.parse(saved)
      } catch {
        return false
      }
    }
    return false // Sempre inicia no tema claro por padrão
  })

  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(isDark))
    } catch {
      // Silenciar erro de localStorage em caso de problemas
    }
    // Aplica classe 'dark' no body ou html
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev: boolean) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
