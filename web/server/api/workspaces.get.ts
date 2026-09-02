import { listWorkspaceCards } from '../utils/workspaces'
import { requireAccessToken } from '../utils/session'

export default defineEventHandler(async (event) => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return listWorkspaceCards(accessToken)
})
