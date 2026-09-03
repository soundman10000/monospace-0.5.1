import type { AuthUser } from '#shared/auth'
import { loginWithPassword, readCurrentUser } from '../../utils/auth-api'
import { setAuthSession } from '../../utils/session'

export default defineEventHandler(async (event): Promise<{ user: AuthUser }> => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body?.email?.trim()
  const password = body?.password

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  try {
    const tokens = await loginWithPassword(email, password)
    event.context.accessToken = tokens.accessToken
    const user = await readCurrentUser()
    await setAuthSession(event, tokens, user, { workspace: null })
    return { user }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }
})

