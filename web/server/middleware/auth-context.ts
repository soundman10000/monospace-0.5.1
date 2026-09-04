import { getAuthSession, requireAccessToken, sessionTheme } from '../utils/session'

export default defineEventHandler(async (event) => {
  const accessToken = await requireAccessToken(event)
  const session = await getAuthSession(event)
  event.context.theme = sessionTheme(session.data)
  if (!accessToken) return

  event.context.accessToken = accessToken
  event.context.user = session.data.user ?? null
  event.context.workspace = session.data.workspace ?? null
})
