import { loginWithPassword, readCurrentUser } from '../../utils/auth-api'
import { setAuthSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event)
  const email = body?.email?.trim()
  const password = body?.password

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  try {
    const tokens = await loginWithPassword(email, password)
    const user = await readCurrentUser(tokens.accessToken)
    await setAuthSession(event, tokens, user)
    return { user }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }
})

