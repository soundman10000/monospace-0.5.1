import type { ChatTool, ChatToolCall } from './provider'

const PROTOCOL = '2025-11-25'
const READ_TOOLS = new Set(['list_items', 'read_schema', 'read_data_sources'])
const MAX_RESULT = 24_000

type JsonRpcSuccess = {
  result?: unknown
  error?: { message?: string }
}

type McpTool = {
  name?: string
  description?: string
  title?: string
  inputSchema?: Record<string, unknown>
}

type McpContent = {
  type?: string
  text?: string
}

const trimSlash = (url: string) => url.replace(/\/$/, '')

const asObject = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const toParameters = (schema: Record<string, unknown> | undefined): Record<string, unknown> => {
  const properties = asObject(schema?.properties) ?? {}
  const required = Array.isArray(schema?.required)
    ? schema.required.filter((item): item is string => typeof item === 'string')
    : []
  return {
    type: 'object',
    properties,
    ...(required.length ? { required } : {}),
    additionalProperties: true,
  }
}

const toChatTool = (tool: McpTool): ChatTool | null => {
  const name = tool.name?.trim()
  if (!name || !READ_TOOLS.has(name)) return null
  return {
    name,
    description: tool.description?.trim() || tool.title?.trim() || name,
    parameters: toParameters(asObject(tool.inputSchema) ?? undefined),
  }
}

const stringifyResult = (value: unknown): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (text.length <= MAX_RESULT) return text
  return `${text.slice(0, MAX_RESULT)}\n…truncated`
}

export type McpClient = {
  listTools: () => Promise<ChatTool[]>
  callTool: (call: ChatToolCall) => Promise<string>
}

export const openMcpClient = async (input: {
  baseUrl: string
  workspace: string
  accessToken: string
  signal?: AbortSignal
}): Promise<McpClient> => {
  const url = `${trimSlash(input.baseUrl)}/api/${encodeURIComponent(input.workspace)}/mcp`
  let nextId = 1

  const rpc = async (payload: Record<string, unknown>): Promise<unknown> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': PROTOCOL,
      },
      body: JSON.stringify(payload),
      signal: input.signal,
    })
    if (payload.id === undefined) return null
    const body = (await response.json().catch(() => null)) as JsonRpcSuccess | null
    if (!response.ok || !body || body.error) {
      const message = body?.error?.message || `MCP ${String(payload.method)} failed`
      throw createError({ statusCode: 502, statusMessage: message })
    }
    return body.result
  }

  await rpc({
    jsonrpc: '2.0',
    id: nextId++,
    method: 'initialize',
    params: {
      protocolVersion: PROTOCOL,
      capabilities: {},
      clientInfo: { name: 'benefits-chat', version: '0.1.0' },
    },
  })
  await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' })

  return {
    listTools: async () => {
      const result = asObject(await rpc({ jsonrpc: '2.0', id: nextId++, method: 'tools/list' }))
      const raw = Array.isArray(result?.tools) ? result.tools : []
      return raw
        .map((item) => toChatTool(asObject(item) as McpTool))
        .filter((tool): tool is ChatTool => Boolean(tool))
    },
    callTool: async (call) => {
      let args: unknown = {}
      if (call.arguments.trim()) {
        try {
          args = JSON.parse(call.arguments)
        } catch {
          return JSON.stringify({ error: 'Invalid tool arguments' })
        }
      }
      try {
        const result = asObject(
          await rpc({
            jsonrpc: '2.0',
            id: nextId++,
            method: 'tools/call',
            params: { name: call.name, arguments: args },
          }),
        )
        const content = Array.isArray(result?.content) ? (result.content as McpContent[]) : []
        const text = content
          .map((part) => (typeof part.text === 'string' ? part.text : ''))
          .filter(Boolean)
          .join('\n')
        if (result?.isError) {
          return stringifyResult({ error: text || 'Tool failed' })
        }
        return stringifyResult(text || result || {})
      } catch (error) {
        const message = error && typeof error === 'object' && 'statusMessage' in error
          ? String((error as { statusMessage?: string }).statusMessage)
          : 'Tool failed'
        return JSON.stringify({ error: message })
      }
    },
  }
}
