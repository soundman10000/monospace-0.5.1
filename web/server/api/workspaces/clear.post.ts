import { clearSessionWorkspace } from '../../utils/workspaces'
import { requireAuth } from '../../utils/session'

export default defineEventHandler(async (event): Promise<{ workspace: null }> => {
  requireAuth(event)
  await clearSessionWorkspace(event)
  return { workspace: null }
})
