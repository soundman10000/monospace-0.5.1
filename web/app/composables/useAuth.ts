export type AuthUser = {
  id: string
  email: string
  fullName: string | null
}

export type AuthWorkspace = {
  id: string
  apiName: string
  displayName: string
  primaryColor: string
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

export const emptyAuth = (): AuthState => ({
  loggedIn: false,
  user: null,
  workspace: null,
})

export const useAuth = () => useState<AuthState>('auth', emptyAuth)
