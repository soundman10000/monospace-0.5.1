import type { FetchOptions } from 'ofetch'

type UntypedFetch = (url: string, options?: FetchOptions) => Promise<unknown>

export const apiFetch = <T>(url: string, options?: FetchOptions): Promise<T> => {
  const requestFetch = useRequestFetch() as unknown as UntypedFetch
  return requestFetch(url, options) as Promise<T>
}
