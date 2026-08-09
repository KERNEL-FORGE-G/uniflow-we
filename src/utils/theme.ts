/**
 * UniFlow Theme Management Utility
 * Supports System-based dark mode preferences and manual user overrides.
 */

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'uniflow_theme_preference'

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved
  }
  return 'system'
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, mode)

  const root = document.documentElement
  root.classList.remove('dark', 'light')

  if (mode === 'dark') {
    root.classList.add('dark')
  } else if (mode === 'light') {
    root.classList.add('light')
  } else {
    // 'system': rely on CSS @media (prefers-color-scheme: dark)
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
