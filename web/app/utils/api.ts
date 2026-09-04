import type { FetchOptions } from 'ofetch'

type UntypedFetch = (url: string, options?: FetchOptions) => Promise<unknown>

const requestPath = (url: string) => url.split('?')[0]

const redirectUnauthenticatedUser = async (url: string) => {
  if (!import.meta.client || requestPath(url) === '/api/auth/login') return

  const route = useRoute()
  if (route.path === '/login') return

  useChat().reset({ close: true })
  useAuth().value = emptyAuth()
  await navigateTo('/login')
}

export const apiFetch = async <T>(url: string, options?: FetchOptions): Promise<T> => {
  const requestFetch = useRequestFetch() as unknown as UntypedFetch
  try {
    return await requestFetch(url, options) as T
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 401) {
      await redirectUnauthenticatedUser(url)
    }
    throw error
  }
}
