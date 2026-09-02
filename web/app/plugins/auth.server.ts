import type { AuthState } from '#shared/auth'

export default defineNuxtPlugin(async () => {
  try {
    useAuth().value = await apiFetch<AuthState>('/api/auth/session')
  } catch {
    useAuth().value = emptyAuth()
  }
})

