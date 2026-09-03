import type { PlanCard, PlansResult } from '#shared/plan'
import { getMonospace } from '../utils/monospace'
import { PLAN_CARD_FIELDS, toCard, todayUtc, type PlanRow } from '../utils/plan'
import { requireAuth } from '../utils/session'

export default defineEventHandler(async (event): Promise<PlansResult> => {
  requireAuth(event)
  const benefit = getQuery(event).benefit
  if (typeof benefit !== 'string' || !benefit.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Benefit is required' })
  }

  const benefitCode = benefit.trim().toUpperCase()
  const client = getMonospace()
  const rows = await client.$readMany<PlanRow>('plan', {
    fields: [...PLAN_CARD_FIELDS],
    filter: { benefit: { code: { _eq: benefitCode } } },
    sort: ['displayOrder', 'code'],
  })
  const today = todayUtc()
  const plans = (Array.isArray(rows) ? rows : [])
    .map((row) => toCard(row, today))
    .filter((plan): plan is PlanCard => plan !== null)

  return { benefitCode, plans }
})
