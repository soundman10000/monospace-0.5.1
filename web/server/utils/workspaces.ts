import type { H3Event } from 'h3'
import type { AuthWorkspace, WorkspaceCard } from '#shared/auth'
import { isUuid } from './id'
import { monospaceGet } from './monospace-api'
import { getAuthSession, requireAuth } from './session'

type WorkspaceRecord = {
  id?: string | null
  apiName?: string | null
  displayName?: string | null
  description?: string | null
  primaryColor?: string | null
  logoId?: string | null
}

const FALLBACK_COLOR = '#737373'
const LIST_FIELDS = 'id,apiName'
const SETTINGS_FIELDS =
  'id,apiName,displayName,description,primaryColor,logoId,logo.id,logo.fileName,logo.mediaType'

const asRecord = (value: unknown): WorkspaceRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as WorkspaceRecord
}

export const isBrandColor = (value: string) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)

const brandColor = (value: string | null | undefined) =>
  value && isBrandColor(value) ? value : FALLBACK_COLOR

const toCard = (value: unknown): WorkspaceCard | null => {
  const record = asRecord(value)
  if (!record?.id || !record.apiName) return null
  return {
    id: record.id,
    apiName: record.apiName,
    displayName: record.displayName?.trim() || record.apiName,
    description: record.description?.trim() || null,
    primaryColor: brandColor(record.primaryColor),
    logoUrl: record.logoId && isUuid(record.logoId) ? `/api/assets/${record.logoId}` : null,
  }
}

export const listWorkspaceCards = async (): Promise<WorkspaceCard[]> => {
  const records = await monospaceGet<WorkspaceRecord[]>('/system/workspaces', {
    fields: LIST_FIELDS,
  })
  const workspaces = Array.isArray(records) ? records : []

  const settings = await Promise.all(
    workspaces.map((workspace) => {
      if (!workspace.id) return Promise.resolve(null)
      return monospaceGet<WorkspaceRecord>(`/system/workspaces/${workspace.id}`, {
        fields: SETTINGS_FIELDS,
      })
    }),
  )

  return settings.map(toCard).filter((card): card is WorkspaceCard => card !== null)
}

export const requireWorkspaceCard = async (
  event: H3Event,
  id: string,
): Promise<WorkspaceCard> => {
  requireAuth(event)
  if (!isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid workspace' })
  }

  const cards = await listWorkspaceCards()
  const card = cards.find((item) => item.id === id)
  if (!card) {
    throw createError({ statusCode: 403, statusMessage: 'Workspace is not available' })
  }
  return card
}

export const toAuthWorkspace = (card: WorkspaceCard): AuthWorkspace => ({
  id: card.id,
  apiName: card.apiName,
  displayName: card.displayName,
  primaryColor: card.primaryColor,
  logoUrl: card.logoUrl,
})

export const setSessionWorkspace = async (event: H3Event, card: WorkspaceCard) => {
  const session = await getAuthSession(event)
  const workspace = toAuthWorkspace(card)
  await session.update({ workspace })
  event.context.workspace = workspace
}

export const clearSessionWorkspace = async (event: H3Event) => {
  const session = await getAuthSession(event)
  await session.update({ workspace: null })
  event.context.workspace = null
}
