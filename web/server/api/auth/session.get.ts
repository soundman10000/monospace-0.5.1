import { getAuthSession, requireAccessToken } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    return { loggedIn: false, user: null, workspace: null }
  }

  const session = await getAuthSession(event)
  return {
    loggedIn: true,
    user: session.data.user ?? null,
    workspace: session.data.workspace ?? null,
  }
})

