import { createClient } from '~/generated/monospace'
import { requireAuth } from './session'

export const getMonospace = () => {
  const event = useEvent()
  const accessToken = requireAuth(event)
  const project = event.context.workspace?.apiName
  if (!project) {
    throw createError({ statusCode: 409, statusMessage: 'No workspace selected' })
  }

  return createClient({
    url: useRuntimeConfig().monospaceUrl,
    project,
    apiKey: accessToken,
  })
}
