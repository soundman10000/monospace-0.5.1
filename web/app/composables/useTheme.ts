import type { ThemeName } from '#shared/theme'

export const useTheme = () => useState<ThemeName>('theme', () => 'light')

export const useThemeToggle = () => {
  const theme = useTheme()
  const pending = ref(false)
  const dark = computed(() => theme.value === 'dark')

  const setTheme = async (next: ThemeName) => {
    if (theme.value === next || pending.value) return
    const previous = theme.value
    theme.value = next
    pending.value = true
    try {
      await apiFetch('/api/auth/theme', { method: 'POST', body: { theme: next } })
    } catch {
      theme.value = previous
    } finally {
      pending.value = false
    }
  }

  const toggleTheme = () => setTheme(theme.value === 'dark' ? 'light' : 'dark')

  return { theme, dark, pending, setTheme, toggleTheme }
}
