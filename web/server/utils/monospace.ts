import type { H3Event } from 'h3'
import { createClient } from '~/generated/monospace'
import { getAuthSession, requireAccessToken } from './session'

export const createMonospaceClient = (accessToken: string, project: string) => {
  const config = useRuntimeConfig()
  return createClient({
    url: config.monospaceUrl,
    project,
    apiKey: accessToken,
  })
}

export const getMonospace = async (event: H3Event) => {
  const accessToken = await requireAccessToken(event)
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const session = await getAuthSession(event)
  const project = session.data.workspace?.apiName
  if (!project) {
    throw createError({ statusCode: 409, statusMessage: 'No workspace selected' })
  }

  return createMonospaceClient(accessToken, project)
}
