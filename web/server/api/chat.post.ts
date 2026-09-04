import type { ChatRequest, ChatStreamEvent } from '#shared/chat'
import { getChatProvider, parseChatMessages } from '../utils/ai'
import { requireAuth } from '../utils/session'

const publicChatError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const status = (error as { statusCode?: unknown }).statusCode
    const message = (error as { statusMessage?: unknown }).statusMessage
    if (
      typeof message === 'string' &&
      message &&
      (status === 502 || status === 503)
    ) {
      return message
    }
  }
  return 'Chat failed'
}

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody<ChatRequest>(event)
  const messages = parseChatMessages(body)
  const provider = getChatProvider()
  provider.assertConfigured()

  const eventStream = createEventStream(event)
  const abort = new AbortController()
  eventStream.onClosed(() => abort.abort())

  const send = async (payload: ChatStreamEvent) => {
    if (abort.signal.aborted) return
    await eventStream.push(JSON.stringify(payload))
  }

  void (async () => {
    try {
      await provider.streamChat(messages, {
        signal: abort.signal,
        onDelta: (text) => send({ type: 'delta', text }),
      })
      await send({ type: 'done' })
    } catch (error) {
      if (!abort.signal.aborted) {
        await send({ type: 'error', message: publicChatError(error) })
      }
    } finally {
      await eventStream.close()
    }
  })()

  return eventStream.send()
})
