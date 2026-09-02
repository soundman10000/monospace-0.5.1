import type { AuthUser, AuthWorkspace } from '#shared/auth'

declare module 'h3' {
  interface H3EventContext {
    accessToken?: string
    user?: AuthUser | null
    workspace?: AuthWorkspace | null
  }
}

export {}
