export const useLogout = () => {
  const auth = useAuth()
  const { reset } = useChat()
  const pending = ref(false)

  const logout = async () => {
    pending.value = true
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
      reset({ close: true })
      auth.value = emptyAuth()
      await navigateTo('/login', { replace: true })
    } finally {
      pending.value = false
    }
  }

  return { logout, pending }
}
