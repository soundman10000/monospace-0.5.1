export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuth()
  const isPublic = to.meta.auth === false

  if (!auth.value.loggedIn && !isPublic) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (auth.value.loggedIn && isPublic) {
    const redirect = to.query.redirect
    const target =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/'
    return navigateTo(target)
  }
})
