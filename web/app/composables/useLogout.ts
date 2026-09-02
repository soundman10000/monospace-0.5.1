export const useLogout = () => {
  const auth = useAuth()
  const pending = ref(false)

  const logout = async () => {
    pending.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      auth.value = emptyAuth()
      await navigateTo('/login')
    } finally {
      pending.value = false
    }
  }

  return { logout, pending }
}
