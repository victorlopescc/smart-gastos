import React, { createContext, useState, useEffect } from 'react'
import type { ThemeContextType } from '../types/theme'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved !== null) {
      return JSON.parse(saved)
    }
    return false // Sempre inicia no tema claro por padrão
  })

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDark))
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export { ThemeContext }
