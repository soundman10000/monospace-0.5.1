export default defineNuxtPlugin(async () => {
  const requestFetch = useRequestFetch()
  try {
    useAuth().value = await requestFetch('/api/auth/session')
  } catch {
    useAuth().value = { loggedIn: false, user: null }
  }
})
