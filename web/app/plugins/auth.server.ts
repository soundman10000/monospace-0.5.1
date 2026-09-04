import type { SessionState } from '#shared/auth'

export default defineNuxtPlugin(async () => {
  try {
    const session = await apiFetch<SessionState>('/api/auth/session')
    useAuth().value = {
      loggedIn: session.loggedIn,
      user: session.user,
      workspace: session.workspace,
    }
    useTheme().value = session.theme
  } catch {
    useAuth().value = emptyAuth()
  }
})

