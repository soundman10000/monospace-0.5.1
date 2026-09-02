import type { WorkspaceCard } from '#shared/auth'
import { listWorkspaceCards } from '../utils/workspaces'
import { requireAuth } from '../utils/session'

export default defineEventHandler(async (event): Promise<WorkspaceCard[]> => {
  requireAuth(event)
  return listWorkspaceCards()
})
