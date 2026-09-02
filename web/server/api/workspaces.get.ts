import type { WorkspaceCard } from '#shared/auth'
import { listWorkspaceCards } from '../utils/workspaces'
import { requireAccessToken } from '../utils/session'

export default defineEventHandler(async (event): Promise<WorkspaceCard[]> => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return listWorkspaceCards(accessToken)
})
