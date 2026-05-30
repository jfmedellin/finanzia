"use client"

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

const THEME_KEY = 'finanzia-theme'

type ThemeMode = 'light' | 'dark'

function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getPreferredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 border-border bg-card px-3 text-foreground shadow-card hover:bg-muted"
      onClick={() => {
        setTheme(next)
        applyTheme(next)
        window.localStorage.setItem(THEME_KEY, next)
      }}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={theme === 'dark' ? 'Modo oscuro activo' : 'Modo claro activo'}
    >
      {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
    </Button>
  )
}
