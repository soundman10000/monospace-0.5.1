import type { BenefitCard } from '#shared/benefit'
import { getMonospace } from '../utils/monospace'
import { requireAuth } from '../utils/session'
import { isBrandColor } from '../utils/workspaces'

type BenefitRow = {
  id?: string | null
  code?: string | null
  name?: string | null
  description?: string | null
  model_benefit?: {
    color?: string | null
    icon?: string | null
  } | null
}

const FALLBACK_COLOR = '#737373'
const ICON_RE = /^[a-z0-9_]+$/i

const toCard = (row: BenefitRow): BenefitCard | null => {
  if (!row.id || !row.code) return null
  const color = row.model_benefit?.color
  const icon = row.model_benefit?.icon?.trim() ?? null
  return {
    id: row.id,
    code: row.code,
    name: row.name?.trim() || row.code,
    description: row.description?.trim() || null,
    color: color && isBrandColor(color) ? color : FALLBACK_COLOR,
    icon: icon && ICON_RE.test(icon) ? icon : null,
  }
}

export default defineEventHandler(async (event): Promise<BenefitCard[]> => {
  requireAuth(event)
  const client = getMonospace()
  const rows = await client.$readMany<BenefitRow>('benefit', {
    fields: [
      'id',
      'code',
      'name',
      'description',
      { model_benefit: { fields: ['color', 'icon'] } },
    ],
    sort: ['code'],
  })
  return (Array.isArray(rows) ? rows : []).map(toCard).filter((card): card is BenefitCard => card !== null)
})
