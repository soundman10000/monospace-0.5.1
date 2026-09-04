import type { ChatMessage } from '#shared/chat'
import type {
  ChatProvider,
  ChatProviderOptions,
  ChatStreamHandlers,
  ChatTool,
  ChatToolCall,
} from './provider'

const XAI_URL = 'https://api.x.ai/v1/chat/completions'
const MAX_TOOL_ROUNDS = 6

type XaiConfig = {
  apiKey: string
  model: string
}

type XaiToolCallDelta = {
  index?: number
  id?: string
  type?: string
  function?: {
    name?: string
    arguments?: string
  }
}

type XaiChunk = {
  choices?: Array<{
    delta?: {
      content?: unknown
      tool_calls?: XaiToolCallDelta[]
    }
    finish_reason?: string | null
  }>
}

type XaiMessage =
  | { role: 'system' | 'user'; content: string }
  | {
      role: 'assistant'
      content: string | null
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: { name: string; arguments: string }
      }>
    }
  | { role: 'tool'; tool_call_id: string; content: string }

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

const toXaiTools = (tools: ChatTool[]) =>
  tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))

const mergeToolCall = (
  acc: Map<number, ChatToolCall>,
  delta: XaiToolCallDelta,
) => {
  const index = delta.index ?? acc.size
  const current = acc.get(index) ?? { id: '', name: '', arguments: '' }
  if (delta.id) current.id = delta.id
  if (delta.function?.name) current.name += delta.function.name
  if (typeof delta.function?.arguments === 'string') {
    current.arguments += delta.function.arguments
  }
  acc.set(index, current)
}

const consumeXaiStream = async (
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void | Promise<void>,
): Promise<{ finishReason: string | null; toolCalls: ChatToolCall[] }> => {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  const toolCalls = new Map<number, ChatToolCall>()
  let finishReason: string | null = null
  let buffer = ''

  const consumeLine = async (line: string) => {
    if (!line.startsWith('data:')) return
    const data = line.slice(5).trim()
    if (!data || data === '[DONE]') return
    try {
      const parsed = JSON.parse(data) as XaiChunk
      const choice = parsed.choices?.[0]
      const reason = choice?.finish_reason
      if (reason) finishReason = reason
      const content = choice?.delta?.content
      if (typeof content === 'string' && content) await onDelta(content)
      for (const call of choice?.delta?.tool_calls ?? []) mergeToolCall(toolCalls, call)
    } catch {}
  }

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        const tail = buffer.replace(/\r$/, '')
        if (tail) await consumeLine(tail)
        break
      }
      buffer += decoder.decode(value, { stream: true })
      for (;;) {
        const newline = buffer.indexOf('\n')
        if (newline === -1) break
        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)
        await consumeLine(line)
      }
    }
  } finally {
    try {
      await reader.cancel()
    } catch {}
  }

  return {
    finishReason,
    toolCalls: [...toolCalls.values()].filter((call) => call.id && call.name),
  }
}

const completeTurn = async (
  messages: XaiMessage[],
  handlers: ChatStreamHandlers,
  config: XaiConfig,
  tools: ChatTool[],
): Promise<{ finishReason: string | null; toolCalls: ChatToolCall[] }> => {
  let response: Response
  try {
    response = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: config.model,
        stream: true,
        messages,
        ...(tools.length
          ? { tools: toXaiTools(tools), tool_choice: 'auto' }
          : {}),
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

  return consumeXaiStream(response.body, handlers.onDelta)
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
    const config = readXaiConfig()
    if (!config.apiKey) {
      throw createError({ statusCode: 503, statusMessage: 'Chat is not configured' })
    }

    const systemPrompt = handlers.systemPrompt || options.systemPrompt
    const tools = handlers.tools ?? []
    const convo: XaiMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]

    let emitted = false
    const onDelta = async (text: string) => {
      emitted = true
      await handlers.onDelta(text)
    }

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      if (round > 0 && emitted) await onDelta('\n\n')
      const { finishReason, toolCalls } = await completeTurn(
        convo,
        { ...handlers, onDelta },
        config,
        tools,
      )
      if (!toolCalls.length || finishReason !== 'tool_calls' || !handlers.executeTool) {
        return
      }

      convo.push({
        role: 'assistant',
        content: null,
        tool_calls: toolCalls.map((call) => ({
          id: call.id,
          type: 'function',
          function: { name: call.name, arguments: call.arguments },
        })),
      })

      for (const call of toolCalls) {
        const output = await handlers.executeTool(call)
        convo.push({
          role: 'tool',
          tool_call_id: call.id,
          content: output,
        })
      }
    }
  }

  return {
    id: 'xai',
    assertConfigured,
    streamChat,
  }
}
