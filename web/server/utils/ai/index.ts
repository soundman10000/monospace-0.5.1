import type { ChatMessage, ChatPageContext } from '#shared/chat'
import type { AuthUser, AuthWorkspace } from '#shared/auth'
import type { ChatProvider } from './provider'
import { createXaiChatProvider } from './xai'

export type { ChatProvider, ChatProviderOptions, ChatStreamHandlers, ChatTool, ChatToolCall } from './provider'
export { openMcpClient } from './mcp'
export { createCmsTools } from './cms-tools'

const MAX_MESSAGES = 40
const MAX_CONTENT_LENGTH = 8000

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful assistant for an employee benefits portal. Answer clearly and concisely.'

const providers: Record<string, () => ChatProvider> = {
  xai: () => createXaiChatProvider({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),
}

const readProviderId = (): string => {
  const config = useRuntimeConfig() as ReturnType<typeof useRuntimeConfig> & {
    aiProvider?: string
  }
  return String(config.aiProvider || 'xai').trim().toLowerCase() || 'xai'
}

export const getChatProvider = (): ChatProvider => {
  const id = readProviderId()
  const create = providers[id]
  if (!create) {
    throw createError({ statusCode: 503, statusMessage: 'Unknown chat provider' })
  }
  return create()
}

const asStringRecord = (value: unknown): Record<string, string> | undefined => {
  const raw = value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
  if (!raw) return undefined
  const params: Record<string, string> = {}
  for (const [key, item] of Object.entries(raw)) {
    if (typeof item === 'string' && item) params[key] = item
  }
  return Object.keys(params).length ? params : undefined
}

export const parseChatContext = (body: unknown): ChatPageContext | null => {
  if (!body || typeof body !== 'object' || !('context' in body)) return null
  const raw = (body as { context?: unknown }).context
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const path = (raw as { path?: unknown }).path
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 500) return null
  const title = (raw as { title?: unknown }).title
  return {
    path,
    title: typeof title === 'string' && title.trim() ? title.trim().slice(0, 200) : undefined,
    params: asStringRecord((raw as { params?: unknown }).params),
  }
}

export const buildSystemPrompt = (input: {
  user?: AuthUser | null
  workspace?: AuthWorkspace | null
  context?: ChatPageContext | null
  toolsAvailable: boolean
}): string => {
  const lines = [
    DEFAULT_SYSTEM_PROMPT,
    'Help the signed-in employee understand their benefits, plans, and coverage.',
    'Do not invent plan names, prices, eligibility, or card copy. If a tool returns nothing, say so.',
  ]

  if (input.user) {
    lines.push(`User: ${input.user.fullName || input.user.email} <${input.user.email}>.`)
  }
  if (input.workspace) {
    lines.push(`Client workspace: ${input.workspace.displayName} (api name ${input.workspace.apiName}).`)
  } else {
    lines.push('No client workspace is selected yet.')
  }

  if (input.context) {
    const parts = [`The employee is currently at ${input.context.path}`]
    if (input.context.title) parts.push(`(${input.context.title})`)
    lines.push(`${parts.join(' ')}. That path is only orientation. Do not assume page content from it.`)
    const params = input.context.params
    if (params?.id && input.context.path.startsWith('/plans/')) {
      lines.push(`Current plan id: ${params.id}.`)
    } else if (params?.id && input.context.path.startsWith('/benefits/')) {
      lines.push(`Current benefit id: ${params.id}.`)
    }
  }

  if (input.toolsAvailable) {
    lines.push(
      'Do not quote from the webpage. Load data with tools.',
      'For benefit and plan catalog rows (names, codes, features), use MCP: read_schema then list_items. Fields are strings only; follow ids across calls.',
      'For coverage page copy and cards, use the CMS tools: read_cms_schema, list_coverage_pages, read_plan_coverage. MCP list_items cannot return that nest.',
      'read_plan_coverage is the way to quote card titles and body text. Keep list_items limits small. Never create, update, delete, or migrate data.',
    )
  }

  return lines.join(' ')
}

export const parseChatMessages = (body: unknown): ChatMessage[] => {
  const raw =
    body && typeof body === 'object' && 'messages' in body
      ? (body as { messages: unknown }).messages
      : undefined

  if (!Array.isArray(raw) || raw.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Messages are required' })
  }
  if (raw.length > MAX_MESSAGES) {
    throw createError({ statusCode: 400, statusMessage: 'Too many messages' })
  }

  const messages: ChatMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid message' })
    }
    const role = (item as { role?: unknown }).role
    const content = (item as { content?: unknown }).content
    if (role !== 'user' && role !== 'assistant') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid message role' })
    }
    if (typeof content !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid message content' })
    }
    const text = content.trim()
    if (!text) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid message content' })
    }
    if (text.length > MAX_CONTENT_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: 'Message is too long' })
    }
    messages.push({ role, content: text })
  }

  if (messages[messages.length - 1]?.role !== 'user') {
    throw createError({ statusCode: 400, statusMessage: 'Last message must be from the user' })
  }

  return messages
}
