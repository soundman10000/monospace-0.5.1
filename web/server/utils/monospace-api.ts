import type { FetchOptions } from 'ofetch'

const trimSlash = (url: string) => url.replace(/\/$/, '')

const AUTH_PATH = /\/auth\/(providers\/local\/password\/login|refresh)(?:\?|$)/

const getClient = () => {
  const config = useRuntimeConfig()
  return $fetch.create({
    baseURL: `${trimSlash(String(config.monospaceUrl))}/api`,
    onRequest({ request, options }) {
      const url = typeof request === 'string' ? request : request.toString()
      if (AUTH_PATH.test(url)) return

      let token: string | undefined
      try {
        token = useEvent().context.accessToken
      } catch {
        return
      }
      if (!token) return

      const headers = new Headers(options.headers as HeadersInit)
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      options.headers = headers
    },
  })
}

export const unwrap = <T>(value: unknown): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data
  }
  return value as T
}

export const monospaceFetch = <T>(path: string, options?: FetchOptions) =>
  getClient()<T>(path, options as never)

export const monospaceRaw = (path: string, options?: FetchOptions) =>
  getClient().raw(path, options as never)

export const monospaceGet = async <T>(
  path: string,
  query?: Record<string, string>,
): Promise<T> => unwrap<T>(await monospaceFetch<unknown>(path, { query }))
