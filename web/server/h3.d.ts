import type { AuthUser, AuthWorkspace } from '#shared/auth'
import type { ThemeName } from '#shared/theme'

declare module 'h3' {
  interface H3EventContext {
    accessToken?: string
    user?: AuthUser | null
    workspace?: AuthWorkspace | null
    theme?: ThemeName
  }
}

export {}
