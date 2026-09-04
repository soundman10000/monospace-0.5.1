import type { ChatMessage } from '#shared/chat'

export type ChatStreamHandlers = {
  onDelta: (text: string) => void | Promise<void>
  signal?: AbortSignal
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
