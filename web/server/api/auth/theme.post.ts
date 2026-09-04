import { isThemeName, type ThemeName } from '#shared/theme'
import { requireAuth, setSessionTheme } from '../../utils/session'

export default defineEventHandler(async (event): Promise<{ theme: ThemeName }> => {
  requireAuth(event)
  const body = await readBody<{ theme?: unknown }>(event)
  if (!isThemeName(body?.theme)) {
    throw createError({ statusCode: 400, statusMessage: 'Theme is invalid' })
  }

  await setSessionTheme(event, body.theme)
  return { theme: body.theme }
})