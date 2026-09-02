import { getAuthSession, requireAccessToken } from '../utils/session'

export default defineEventHandler(async (event) => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) return

  const session = await getAuthSession(event)
  event.context.accessToken = accessToken
  event.context.user = session.data.user ?? null
  event.context.workspace = session.data.workspace ?? null
})
