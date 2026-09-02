import { requireWorkspaceCard, setSessionWorkspace, toAuthWorkspace } from '../../utils/workspaces'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: string }>(event)
  const card = await requireWorkspaceCard(event, body?.id ?? '')
  await setSessionWorkspace(event, card)
  return { workspace: toAuthWorkspace(card) }
})
