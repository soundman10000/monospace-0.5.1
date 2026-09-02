import type { AuthUser } from '#shared/auth'
import { isUuid } from './id'

export type LoginTokens = {
  accessToken: string
  refreshToken: string
  expires: number
}

const trimSlash = (url: string) => url.replace(/\/$/, '')

const unwrap = <T>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data
  }
  return value as T
}

const apiUrl = (path: string) => {
  const config = useRuntimeConfig()
  return `${trimSlash(config.monospaceUrl)}${path}`
}

export const loginWithPassword = async (
  email: string,
  password: string,
): Promise<LoginTokens> => {
  const body = await $fetch<unknown>(apiUrl('/api/auth/providers/local/password/login'), {
    method: 'POST',
    body: { email, password, mode: 'json' },
  })
  const tokens = unwrap<LoginTokens>(body)
  if (!tokens?.accessToken) {
    throw new Error('Login did not return an access token')
  }
  return tokens
}

export const refreshTokens = async (refreshToken: string): Promise<LoginTokens> => {
  const body = await $fetch<unknown>(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
  const tokens = unwrap<LoginTokens>(body)
  if (!tokens?.accessToken) {
    throw new Error('Refresh did not return an access token')
  }
  return tokens
}

export const readCurrentUser = async (accessToken: string): Promise<AuthUser> => {
  const body = await $fetch<unknown>(apiUrl('/api/system/users/me'), {
    query: { fields: 'id,email,fullName,avatarId' },
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const user = unwrap<AuthUser & { avatarId?: string | null }>(body)
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
