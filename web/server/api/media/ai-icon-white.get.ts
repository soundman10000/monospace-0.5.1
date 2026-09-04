import { requireAuth } from '../../utils/session'

export default defineEventHandler(async (event): Promise<void> => {
  requireAuth(event)

  const assets = useStorage('assets:server')
  const data = await assets.getItemRaw('ai-icon-white.png')
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  setHeader(event, 'content-type', 'image/png')
  setHeader(event, 'cache-control', 'private, max-age=86400')
  await send(event, data, 'image/png')
})
