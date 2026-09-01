import type { H3Event } from 'h3'
import { createClient } from '~/generated/monospace'
import { requireAccessToken } from './session'

export const createMonospaceClient = (accessToken: string) => {
  const config = useRuntimeConfig()
  return createClient({
    url: config.monospaceUrl,
    project: config.public.monospaceProject,
    apiKey: accessToken,
  })
}

export const getMonospace = async (event: H3Event) => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return createMonospaceClient(accessToken)
}
