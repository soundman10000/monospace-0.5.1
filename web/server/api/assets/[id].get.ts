import { isUuid } from '../../utils/id'
import { monospaceRaw } from '../../utils/monospace-api'
import { requireAuth } from '../../utils/session'

export default defineEventHandler(async (event): Promise<void> => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || !isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid asset' })
  }

  const response = await monospaceRaw(`/system/assets/${id}`, {
    responseType: 'arrayBuffer',
  })
  const data = response._data
  if (!(data instanceof ArrayBuffer)) {
    throw createError({ statusCode: 502, statusMessage: 'Asset not found' })
  }

  setHeader(event, 'cache-control', 'private, max-age=86400')
  await send(
    event,
    Buffer.from(data),
    response.headers.get('content-type') || 'application/octet-stream',
  )
})
