import type { ChatMessage } from '#shared/chat'

export type ChatTool = {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type ChatToolCall = {
  id: string
  name: string
  arguments: string
}

export type ChatStreamHandlers = {
  onDelta: (text: string) => void | Promise<void>
  signal?: AbortSignal
  systemPrompt?: string
  tools?: ChatTool[]
  executeTool?: (call: ChatToolCall) => Promise<string>
}

export type ChatProviderOptions = {
  systemPrompt?: string
}

export type ChatProvider = {
  readonly id: string
  assertConfigured: () => void
  streamChat: (
    messages: ChatMessage[],
    handlers: ChatStreamHandlers,
  ) => Promise<void>
}
