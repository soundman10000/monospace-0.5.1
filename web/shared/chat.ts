export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type ChatPageContext = {
  path: string
  title?: string
  params?: Record<string, string>
}

export type ChatRequest = {
  messages: ChatMessage[]
  context?: ChatPageContext
}

export type ChatStreamDelta = {
  type: 'delta'
  text: string
}

export type ChatStreamDone = {
  type: 'done'
}

export type ChatStreamError = {
  type: 'error'
  message: string
}

export type ChatStreamEvent = ChatStreamDelta | ChatStreamDone | ChatStreamError
