import type { AuthState } from '#shared/auth'

export type { AuthUser, AuthWorkspace, WorkspaceCard, AuthState } from '#shared/auth'

export const emptyAuth = (): AuthState => ({
  loggedIn: false,
  user: null,
  workspace: null,
})

export const useAuth = () => useState<AuthState>('auth', emptyAuth)
