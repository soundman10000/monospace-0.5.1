import type { ChatMessage, ChatRequest, ChatStreamEvent } from '#shared/chat'

let abortController: AbortController | null = null
const introTimers: ReturnType<typeof setTimeout>[] = []

const isAbortError = (error: unknown) =>
  (error instanceof DOMException && error.name === 'AbortError')
  || (error as { name?: string }).name === 'AbortError'

const parseStreamEvent = (payload: string): ChatStreamEvent | null => {
  try {
    const event = JSON.parse(payload) as ChatStreamEvent
    if (event.type === 'delta' && typeof event.text === 'string') return event
    if (event.type === 'done') return event
    if (event.type === 'error' && typeof event.message === 'string') return event
    return null
  } catch {
    return null
  }
}

export const useChat = () => {
  const open = useState('chat-open', () => false)
  const messages = useState<ChatMessage[]>('chat-messages', () => [])
  const draft = useState('chat-draft', () => '')
  const streaming = useState('chat-streaming', () => false)
  const error = useState<string | null>('chat-error', () => null)
  const introVisible = useState('chat-intro', () => false)
  const introLeaving = useState('chat-intro-leaving', () => false)
  const introDismissed = useState('chat-intro-dismissed', () => false)

  const clearIntroTimers = () => {
    while (introTimers.length) {
      const timer = introTimers.pop()
      if (timer) clearTimeout(timer)
    }
  }

  const scheduleIntro = (delay: number, fn: () => void) => {
    introTimers.push(setTimeout(fn, delay))
  }

  const dismissIntro = () => {
    clearIntroTimers()
    introVisible.value = false
    introLeaving.value = false
    introDismissed.value = true
  }

  const offerIntro = () => {
    if (!import.meta.client || introDismissed.value || open.value || introVisible.value) return
    if (introTimers.length) return
    scheduleIntro(900, () => {
      if (open.value || introDismissed.value) return
      introVisible.value = true
      introLeaving.value = false
      scheduleIntro(2200, () => {
        if (open.value || introDismissed.value) return
        introLeaving.value = true
        scheduleIntro(450, () => {
          if (introDismissed.value) return
          dismissIntro()
        })
      })
    })
  }

  const toggle = () => {
    if (!open.value) dismissIntro()
    open.value = !open.value
  }

  const openDrawer = () => {
    dismissIntro()
    open.value = true
  }

  const closeDrawer = () => {
    open.value = false
  }

  const reset = (options?: { close?: boolean }) => {
    abortController?.abort()
    abortController = null
    clearIntroTimers()
    messages.value = []
    draft.value = ''
    error.value = null
    streaming.value = false
    introVisible.value = false
    introLeaving.value = false
    introDismissed.value = false
    if (options?.close) open.value = false
  }

  const newChat = () => {
    reset()
  }

  const dropEmptyAssistant = () => {
    const list = messages.value
    const last = list[list.length - 1]
    if (last?.role === 'assistant' && last.content === '') {
      messages.value = list.slice(0, -1)
    }
  }

  const appendDelta = (text: string) => {
    const list = messages.value
    const last = list[list.length - 1]
    if (!last || last.role !== 'assistant') return
    messages.value = list.slice(0, -1).concat({
      role: 'assistant',
      content: last.content + text,
    })
  }

  const redirectUnauthenticated = async () => {
    if (!import.meta.client) return
    const route = useRoute()
    if (route.path === '/login') return
    useAuth().value = emptyAuth()
    await navigateTo('/login')
  }

  const consumeStream = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const handleLine = (line: string): 'stop' | 'continue' => {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) return 'continue'
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') return payload === '[DONE]' ? 'stop' : 'continue'
      const event = parseStreamEvent(payload)
      if (!event) return 'continue'
      if (event.type === 'delta') {
        appendDelta(event.text)
        return 'continue'
      }
      if (event.type === 'error') {
        error.value = event.message
        dropEmptyAssistant()
        return 'stop'
      }
      return 'stop'
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (handleLine(line) === 'stop') return
      }
    }

    buffer += decoder.decode()
    if (buffer.trim()) handleLine(buffer)
  }

  const send = async () => {
    const text = draft.value.trim()
    if (!text || streaming.value) return

    abortController?.abort()
    const controller = new AbortController()
    abortController = controller
    const signal = controller.signal

    draft.value = ''
    error.value = null

    const outgoing: ChatMessage[] = [
      ...messages.value,
      { role: 'user', content: text },
    ]
    messages.value = [
      ...outgoing,
      { role: 'assistant', content: '' },
    ]
    streaming.value = true

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: outgoing } satisfies ChatRequest),
        credentials: 'include',
        signal,
      })

      if (res.status === 401) {
        reset({ close: true })
        await redirectUnauthenticated()
        return
      }

      if (!res.ok || !res.body) {
        error.value = 'Chat request failed'
        dropEmptyAssistant()
        return
      }

      await consumeStream(res.body)
    } catch (err) {
      if (isAbortError(err)) {
        dropEmptyAssistant()
        return
      }
      error.value = err instanceof Error ? err.message : 'Chat request failed'
      dropEmptyAssistant()
    } finally {
      if (abortController === controller) {
        abortController = null
        streaming.value = false
        dropEmptyAssistant()
      }
    }
  }

  return {
    open,
    messages,
    draft,
    streaming,
    error,
    introVisible,
    introLeaving,
    toggle,
    openDrawer,
    closeDrawer,
    reset,
    newChat,
    send,
    offerIntro,
    dismissIntro,
  }
}
