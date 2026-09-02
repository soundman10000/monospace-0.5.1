import { isUuid } from '../../utils/id'
import { requireAccessToken } from '../../utils/session'

export default defineEventHandler(async (event): Promise<void> => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const id = getRouterParam(event, 'id')
  if (!id || !isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid asset' })
  }

  const config = useRuntimeConfig()
  const url = `${String(config.monospaceUrl).replace(/\/$/, '')}/api/system/assets/${id}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: 'Asset not found' })
  }

  setHeader(event, 'cache-control', 'private, max-age=86400')
  await send(
    event,
    Buffer.from(await response.arrayBuffer()),
    response.headers.get('content-type') || 'application/octet-stream',
  )
})
