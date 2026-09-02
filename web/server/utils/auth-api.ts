import type { AuthUser } from '#shared/auth'
import { isUuid } from './id'
import { monospaceFetch, unwrap } from './monospace-api'

export type LoginTokens = {
  accessToken: string
  refreshToken: string
  expires: number
}

const asTokens = (body: unknown): LoginTokens => {
  const tokens = unwrap<LoginTokens>(body)
  if (!tokens?.accessToken) {
    throw new Error('Login did not return an access token')
  }
  return tokens
}

export const loginWithPassword = async (
  email: string,
  password: string,
): Promise<LoginTokens> =>
  asTokens(
    await monospaceFetch<unknown>('/auth/providers/local/password/login', {
      method: 'POST',
      body: { email, password, mode: 'json' },
    }),
  )

export const refreshTokens = async (refreshToken: string): Promise<LoginTokens> =>
  asTokens(
    await monospaceFetch<unknown>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),
  )

export const readCurrentUser = async (): Promise<AuthUser> => {
  const user = unwrap<AuthUser & { avatarId?: string | null }>(
    await monospaceFetch<unknown>('/system/users/me', {
      query: { fields: 'id,email,fullName,avatarId' },
    }),
  )
  if (!user?.id || !user.email) {
    throw new Error('Could not read the current user')
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? null,
    avatarUrl: user.avatarId && isUuid(user.avatarId) ? `/api/assets/${user.avatarId}` : null,
  }
}
