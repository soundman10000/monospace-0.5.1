import type { SessionState } from '#shared/auth'
import { getAuthSession, sessionTheme } from '../../utils/session'

export default defineEventHandler(async (event): Promise<SessionState> => {
  const session = await getAuthSession(event)
  const theme = event.context.theme ?? sessionTheme(session.data)

  if (!event.context.accessToken) {
    return { loggedIn: false, user: null, workspace: null, theme }
  }

  return {
    loggedIn: true,
    user: event.context.user ?? null,
    workspace: event.context.workspace ?? null,
    theme,
  }
})
