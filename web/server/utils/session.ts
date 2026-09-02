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

export const setAuthSession = async (
  event: H3Event,
  tokens: LoginTokens,
  user: AuthUser,
) => {
  const session = await getAuthSession(event)
  await session.update({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expires * 1000,
    user,
    workspace: session.data.workspace,
  })
}

export const clearAuthSession = async (event: H3Event) => {
  const session = await getAuthSession(event)
  await session.clear()
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
    return null
  }

  try {
    const tokens = await refreshTokens(data.refreshToken)
    await setAuthSession(event, tokens, data.user)
    return tokens.accessToken
  } catch {
    await session.clear()
    return null
  }
}
