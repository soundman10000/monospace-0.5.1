import { clearAuthSession } from '../../utils/session'

export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  await clearAuthSession(event)
  return { ok: true }
})

