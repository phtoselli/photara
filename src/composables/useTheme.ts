import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'photara-theme'

// Shared state across instances
const theme = ref<Theme>('dark')
const isInitialized = ref(false)

export function useTheme() {
  let mediaQuery: MediaQueryList | null = null
  let handleChange: ((e: MediaQueryListEvent) => void) | null = null

  function initializeTheme() {
    if (isInitialized.value) return

    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null

    if (stored === 'light' || stored === 'dark') {
      theme.value = stored
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }

    applyTheme(theme.value)
    isInitialized.value = true
  }

  function applyTheme(newTheme: Theme) {
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  function toggleTheme() {
    const newTheme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  onMounted(() => {
    initializeTheme()

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
  })

  onBeforeUnmount(() => {
    if (mediaQuery && handleChange) {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return {
    theme,
    setTheme,
    toggleTheme,
    initializeTheme,
  }
}
