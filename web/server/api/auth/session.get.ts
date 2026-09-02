import type { AuthState } from '#shared/auth'

export default defineEventHandler((event): AuthState => {
  if (!event.context.accessToken) {
    return { loggedIn: false, user: null, workspace: null }
  }

  return {
    loggedIn: true,
    user: event.context.user ?? null,
    workspace: event.context.workspace ?? null,
  }
})
