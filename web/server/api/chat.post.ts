import type { ChatRequest, ChatStreamEvent } from '#shared/chat'
import {
  buildSystemPrompt,
  getChatProvider,
  openMcpClient,
  parseChatContext,
  parseChatMessages,
  type ChatTool,
  type ChatToolCall,
} from '../utils/ai'
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
  const accessToken = requireAuth(event)
  const body = await readBody<ChatRequest>(event)
  const messages = parseChatMessages(body)
  const context = parseChatContext(body)
  const workspace = event.context.workspace ?? null
  const user = event.context.user ?? null
  const provider = getChatProvider()
  provider.assertConfigured()

  const abort = new AbortController()
  event.node.req.once('aborted', () => abort.abort())

  let tools: ChatTool[] = []
  let executeTool: ((call: ChatToolCall) => Promise<string>) | undefined

  if (workspace?.apiName) {
    try {
      const mcp = await openMcpClient({
        baseUrl: String(useRuntimeConfig(event).monospaceUrl),
        workspace: workspace.apiName,
        accessToken,
        signal: abort.signal,
      })
      tools = await mcp.listTools()
      executeTool = (call) => mcp.callTool(call)
    } catch {
      tools = []
      executeTool = undefined
    }
  }

  const eventStream = createEventStream(event)
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
        systemPrompt: buildSystemPrompt({
          user,
          workspace,
          context,
          toolsAvailable: tools.length > 0,
        }),
        tools,
        executeTool,
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
