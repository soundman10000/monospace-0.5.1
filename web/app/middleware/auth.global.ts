const safePath = (value: unknown) => {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    return value
  }
  return null
}

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  const isPublic = to.meta.auth === false
  const needsWorkspace = to.meta.workspace !== false

  if (!auth.value.loggedIn && !isPublic) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (auth.value.loggedIn && isPublic) {
    const redirect = safePath(to.query.redirect) ?? '/'
    if (!auth.value.workspace && redirect !== '/workspaces') {
      return navigateTo({
        path: '/workspaces',
        query: redirect === '/' ? undefined : { redirect },
      })
    }
    return navigateTo(redirect)
  }

  if (auth.value.loggedIn && needsWorkspace && !auth.value.workspace) {
    return navigateTo({
      path: '/workspaces',
      query: to.path === '/workspaces' ? undefined : { redirect: to.fullPath },
    })
  }
})
