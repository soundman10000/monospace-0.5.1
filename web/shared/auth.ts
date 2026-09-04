import type { ThemeName } from './theme'

export type AuthUser = {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

export type AuthWorkspace = {
  id: string
  apiName: string
  displayName: string
  primaryColor: string
  logoUrl: string | null
}

export type WorkspaceCard = AuthWorkspace & {
  description: string | null
  logoUrl: string | null
}

export type AuthState = {
  loggedIn: boolean
  user: AuthUser | null
  workspace: AuthWorkspace | null
}

export type SessionState = AuthState & {
  theme: ThemeName
}
