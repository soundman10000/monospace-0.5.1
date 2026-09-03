const LEAVE_MS = 300

export const useLeavingCard = () => {
  const leavingId = ref<string | null>(null)

  const prefersReducedMotion = () =>
    import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const startLeave = (id: string) => {
    if (leavingId.value) return null
    leavingId.value = id
    if (prefersReducedMotion()) return Promise.resolve()
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, LEAVE_MS)
    })
  }

  const cancelLeave = () => {
    leavingId.value = null
  }

  return { leavingId, startLeave, cancelLeave }
}
