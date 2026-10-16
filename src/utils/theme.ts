/**
 * UniFlow Theme Management Utility
 * Supports explicit light mode by default, dark mode, and system preferences.
 */

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'uniflow_theme_preference'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }
  return 'light' // Always default to light mode
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, mode)

  const root = document.documentElement
  root.classList.remove('dark', 'light')

  if (mode === 'dark') {
    root.classList.add('dark')
  } else if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.add('light')
    }
  } else {
    // Mode 'light' or default: always force light theme
    root.classList.add('light')
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return
  const currentMode = getStoredTheme()
  applyTheme(currentMode)

  // System media query listener
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemChange = () => {
    if (getStoredTheme() === 'system') {
      applyTheme('system')
    }
  }

  try {
    mediaQuery.addEventListener('change', handleSystemChange)
  } catch {
    mediaQuery.addListener(handleSystemChange)
  }
}
