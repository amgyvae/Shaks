import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeCtx {
  theme: Theme
  toggle: () => void
  isDark: boolean
  c: {
    bg: string
    bgSub: string
    card: string
    cardHover: string
    border: string
    text: string
    textMuted: string
    textFaint: string
    input: string
    inputBorder: string
    navBg: string
    navBorder: string
    sidebarBg: string
  }
}

const dark = {
  bg: '#111111',
  bgSub: '#0d0d0d',
  card: '#1c1c1c',
  cardHover: '#222222',
  border: '#2a2a2a',
  text: '#f0f0f0',
  textMuted: '#9ca3af',
  textFaint: '#6b7280',
  input: '#111111',
  inputBorder: '#333333',
  navBg: '#111111',
  navBorder: '#1e1e1e',
  sidebarBg: '#0f0f0f',
}

const light = {
  bg: '#f5f6f8',
  bgSub: '#eef0f4',
  card: '#ffffff',
  cardHover: '#f9fafb',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  input: '#ffffff',
  inputBorder: '#d1d5db',
  navBg: '#ffffff',
  navBorder: '#e5e7eb',
  sidebarBg: '#f9fafb',
}

const ThemeContext = createContext<ThemeCtx>(null!)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'dark')

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.body.style.background = theme === 'dark' ? dark.bg : light.bg
    document.body.style.color = theme === 'dark' ? dark.text : light.text
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const c = theme === 'dark' ? dark : light

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark', c }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
