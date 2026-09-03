import type { PlanBenefit, PlanCard, PlansResult } from '#shared/plan'
import { isUuid } from '../../utils/id'
import { getMonospace } from '../../utils/monospace'
import { PLAN_CARD_FIELDS, toCard, todayUtc, type PlanRow } from '../../utils/plan'
import { requireAuth } from '../../utils/session'

type BenefitRow = {
  id?: string | null
  code?: string | null
  name?: string | null
}

const toBenefit = (row: BenefitRow): PlanBenefit | null => {
  if (!row.id || !row.code) return null
  return {
    id: row.id,
    code: row.code,
    name: row.name?.trim() || row.code,
  }
}

export default defineEventHandler(async (event): Promise<PlansResult> => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id || !isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid benefit' })
  }

  const client = getMonospace()
  const row = await client.$readFirst<BenefitRow>('benefit', {
    fields: ['id', 'code', 'name'],
    filter: { id: { _eq: id } },
  })
  const benefit = row ? toBenefit(row) : null
  if (!benefit) {
    throw createError({ statusCode: 404, statusMessage: 'Benefit not found' })
  }

  const rows = await client.$readMany<PlanRow>('plan', {
    fields: [...PLAN_CARD_FIELDS],
    filter: { benefitId: { _eq: id } },
    sort: ['displayOrder', 'code'],
  })
  const today = todayUtc()
  const plans = (Array.isArray(rows) ? rows : [])
    .map((plan) => toCard(plan, today))
    .filter((plan): plan is PlanCard => plan !== null)

  return { benefit, plans }
})
