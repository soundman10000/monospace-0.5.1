import type { H3Event } from 'h3'
import type { AuthWorkspace, WorkspaceCard } from '../../app/composables/useAuth'
import { createClient } from '~/generated/monospace'
import { getAuthSession, requireAccessToken } from './session'

type WorkspaceRecord = {
  id?: string | null
  apiName?: string | null
  displayName?: string | null
  description?: string | null
  primaryColor?: string | null
  logoId?: string | null
}

const WORKSPACE_FIELDS = ['id', 'apiName'] as const

const SETTINGS_FIELDS = [
  'id',
  'apiName',
  'displayName',
  'description',
  'primaryColor',
  'logoId',
  { logo: { fields: ['id', 'fileName', 'mediaType'] } },
]

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const FALLBACK_COLOR = '#737373'

const trimSlash = (url: string) => url.replace(/\/$/, '')

const rewriteSystemPath = (path: string) => path.replace(/^\/items/, '') || '/'

const asRecord = (value: unknown): WorkspaceRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as WorkspaceRecord
}

export const isUuid = (value: string) => UUID_RE.test(value)

export const isBrandColor = (value: string) =>
  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)

const brandColor = (value: string | null | undefined) =>
  value && isBrandColor(value) ? value : FALLBACK_COLOR

const createSystemClient = (accessToken: string) => {
  const config = useRuntimeConfig()
  return createClient({
    url: config.monospaceUrl,
    project: 'system',
    apiKey: accessToken,
    http: ({ url, apiKey }) => {
      const api = $fetch.create({
        baseURL: `${trimSlash(url)}/api/system`,
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      return {
        get: (path, options) =>
          api(rewriteSystemPath(path), { method: 'GET', query: options?.query }),
        post: (path, options) =>
          api(rewriteSystemPath(path), {
            method: 'POST',
            body: options?.body,
            query: options?.query,
          }),
        patch: (path, options) =>
          api(rewriteSystemPath(path), {
            method: 'PATCH',
            body: options?.body,
            query: options?.query,
          }),
        delete: (path, options) =>
          api(rewriteSystemPath(path), { method: 'DELETE', query: options?.query }),
      }
    },
  })
}

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

export const listWorkspaceCards = async (accessToken: string): Promise<WorkspaceCard[]> => {
  const client = createSystemClient(accessToken)
  const listed = await client.$readMany<WorkspaceRecord>('workspaces', {
    fields: [...WORKSPACE_FIELDS],
  })
  const workspaces = Array.isArray(listed) ? listed : []

  const settings = await Promise.all(
    workspaces.map((workspace) => {
      if (!workspace.id) {
        return Promise.resolve(null)
      }
      return client.$readOne<WorkspaceRecord>('workspaces', {
        key: workspace.id,
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
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  if (!isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid workspace' })
  }

  const cards = await listWorkspaceCards(accessToken)
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
})

export const setSessionWorkspace = async (event: H3Event, card: WorkspaceCard) => {
  const session = await getAuthSession(event)
  await session.update({
    workspace: toAuthWorkspace(card),
  })
}
