import type { ChatMessage } from '#shared/chat'
import type { ChatProvider } from './provider'
import { createXaiChatProvider } from './xai'

export type { ChatProvider, ChatProviderOptions, ChatStreamHandlers } from './provider'

const MAX_MESSAGES = 40
const MAX_CONTENT_LENGTH = 8000

const SYSTEM_PROMPT =
  'You are a helpful assistant for an employee benefits portal. Answer clearly and concisely.'

const providers: Record<string, () => ChatProvider> = {
  xai: () => createXaiChatProvider({ systemPrompt: SYSTEM_PROMPT }),
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
