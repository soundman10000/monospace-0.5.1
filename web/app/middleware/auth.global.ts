export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  const isPublic = to.meta.auth === false
  const needsWorkspace = to.meta.workspace !== false

  if (!auth.value.loggedIn && !isPublic) {
    return navigateTo('/login')
  }

  if (auth.value.loggedIn && isPublic) {
    return navigateTo('/clients')
  }

  if (auth.value.loggedIn && needsWorkspace && !auth.value.workspace) {
    return navigateTo({
      path: '/clients',
      query: to.path === '/clients' ? undefined : { redirect: to.fullPath },
    })
  }
})
