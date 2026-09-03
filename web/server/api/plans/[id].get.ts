import type { PlanBenefit, PlanDetail } from '#shared/plan'
import { loadCoverage } from '../../utils/coverage'
import { isUuid } from '../../utils/id'
import { getMonospace } from '../../utils/monospace'
import { PLAN_CARD_FIELDS, toCard, todayUtc, type PlanRow } from '../../utils/plan'
import { requireAuth } from '../../utils/session'

type DetailRow = PlanRow & {
  benefit?: {
    id?: string | null
    code?: string | null
    name?: string | null
  } | null
}

const toBenefit = (row: DetailRow, fallbackCode: string): PlanBenefit | null => {
  const id = row.benefit?.id
  const code = row.benefit?.code?.trim() || fallbackCode
  if (!id || !code) return null
  return {
    id,
    code,
    name: row.benefit?.name?.trim() || code,
  }
}

export default defineEventHandler(async (event): Promise<PlanDetail> => {
  requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id || !isUuid(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid plan' })
  }

  const client = getMonospace()
  const row = await client.$readFirst<DetailRow>('plan', {
    fields: [
      ...PLAN_CARD_FIELDS,
      { benefit: { fields: ['id', 'code', 'name'] } },
    ],
    filter: { id: { _eq: id } },
  })
  const card = row ? toCard(row, todayUtc()) : null
  const benefit = row && card ? toBenefit(row, card.code) : null
  if (!card || !benefit) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  return {
    ...card,
    benefit,
    coverage: await loadCoverage(card.id),
  }
})