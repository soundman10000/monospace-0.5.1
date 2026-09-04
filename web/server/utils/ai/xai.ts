import type { ChatMessage } from '#shared/chat'
import type { ChatProvider, ChatProviderOptions, ChatStreamHandlers } from './provider'

const XAI_URL = 'https://api.x.ai/v1/chat/completions'

type XaiChunk = {
  choices?: Array<{
    delta?: {
      content?: unknown
    }
  }>
}

type XaiConfig = {
  apiKey: string
  model: string
}

const readXaiConfig = (): XaiConfig => {
  const config = useRuntimeConfig() as ReturnType<typeof useRuntimeConfig> & {
    xaiApiKey?: string
    xaiModel?: string
  }
  const apiKey = String(
    config.xaiApiKey || process.env.DIRECTUS_AI_XAI_API_KEY || process.env.XAI_API_KEY || '',
  ).trim()
  const model = String(config.xaiModel || 'grok-4.6').trim() || 'grok-4.6'
  return { apiKey, model }
}

const deltaText = (data: string): string | null => {
  try {
    const parsed = JSON.parse(data) as XaiChunk
    const content = parsed.choices?.[0]?.delta?.content
    return typeof content === 'string' && content.length > 0 ? content : null
  } catch {
    return null
  }
}

const consumeSseLine = async (
  line: string,
  onDelta: (text: string) => void | Promise<void>,
): Promise<boolean> => {
  if (!line.startsWith('data:')) return false
  const data = line.slice(5).trim()
  if (!data) return false
  if (data === '[DONE]') return true
  const text = deltaText(data)
  if (text) await onDelta(text)
  return false
}

const consumeXaiStream = async (
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void | Promise<void>,
): Promise<void> => {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        const tail = buffer.replace(/\r$/, '')
        if (tail) await consumeSseLine(tail, onDelta)
        return
      }

      buffer += decoder.decode(value, { stream: true })
      for (;;) {
        const newline = buffer.indexOf('\n')
        if (newline === -1) break
        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)
        if (await consumeSseLine(line, onDelta)) return
      }
    }
  } finally {
    try {
      await reader.cancel()
    } catch {}
  }
}

export const createXaiChatProvider = (
  options: ChatProviderOptions = {},
): ChatProvider => {
  const assertConfigured = () => {
    if (!readXaiConfig().apiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Chat is not configured' })
    }
  }

  const streamChat = async (
    messages: ChatMessage[],
    handlers: ChatStreamHandlers,
  ): Promise<void> => {
    const { apiKey, model } = readXaiConfig()
    if (!apiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Chat is not configured' })
    }

    const payload = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    let response: Response
    try {
      response = await fetch(XAI_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: payload,
        }),
        signal: handlers.signal,
      })
    } catch (error) {
      if (handlers.signal?.aborted) throw error
      throw createError({ statusCode: 502, statusMessage: 'Chat upstream error' })
    }

    if (!response.ok || !response.body) {
      try {
        await response.body?.cancel()
      } catch {}
      throw createError({ statusCode: 502, statusMessage: 'Chat upstream error' })
    }

    await consumeXaiStream(response.body, handlers.onDelta)
  }

  return {
    id: 'xai',
    assertConfigured,
    streamChat,
  }
}
