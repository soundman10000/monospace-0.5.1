import { useSession } from 'h3'
import type { H3Event } from 'h3'
import type { AuthUser, AuthWorkspace } from '#shared/auth'
import { refreshTokens, type LoginTokens } from './auth-api'

export type AuthSession = {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  user?: AuthUser
  workspace?: AuthWorkspace
}

const sessionOptions = (event: H3Event) => ({
  name: 'web-session',
  password: useRuntimeConfig(event).sessionPassword,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  },
})

export const getAuthSession = (event: H3Event) =>
  useSession<AuthSession>(event, sessionOptions(event))

const applyAuthContext = (event: H3Event, data: AuthSession) => {
  event.context.accessToken = data.accessToken
  event.context.user = data.user ?? null
  event.context.workspace = data.workspace ?? null
}

export const setAuthSession = async (
  event: H3Event,
  tokens: LoginTokens,
  user: AuthUser,
  extras?: { workspace?: AuthWorkspace | null },
) => {
  const session = await getAuthSession(event)
  const next = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expires * 1000,
    user,
    workspace: extras && 'workspace' in extras
      ? extras.workspace ?? null
      : session.data.workspace,
  }
  await session.update(next)
  applyAuthContext(event, next)
}

export const clearAuthSession = async (event: H3Event) => {
  const session = await getAuthSession(event)
  await session.clear()
  applyAuthContext(event, {})
}

export const requireAuth = (event: H3Event = useEvent()) => {
  const accessToken = event.context.accessToken
  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }
  return accessToken
}

export const requireAccessToken = async (event: H3Event) => {
  const session = await getAuthSession(event)
  const data = session.data
  if (!data.accessToken) return null

  const skewMs = 30_000
  if (data.expiresAt && Date.now() + skewMs < data.expiresAt) {
    return data.accessToken
  }

  if (!data.refreshToken || !data.user) {
    await session.clear()
    applyAuthContext(event, {})
    return null
  }

  try {
    const tokens = await refreshTokens(data.refreshToken)
    await setAuthSession(event, tokens, data.user)
    return tokens.accessToken
  } catch {
    await session.clear()
    applyAuthContext(event, {})
    return null
  }
}
