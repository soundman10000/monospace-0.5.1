import type { PlanCard, PlanFeature } from '#shared/plan'
import { isBrandColor } from './workspaces'

export type FeatureValueRow = {
  displayValue?: string | null
  booleanValue?: boolean | null
  stringValue?: string | null
  dateValue?: string | null
  integerValue?: number | null
  numberValue?: string | null
  linkValue?: string | null
  fromDate?: string
  toDate?: string
  benefit_feature?: {
    code?: string | null
    name?: string | null
    description?: string | null
    displayOrder?: number | null
    isVisible?: boolean | null
  } | null
}

export type PlanRow = {
  id?: string | null
  code?: string | null
  name?: string | null
  description?: string | null
  displayOrder?: number | null
  benefit?: {
    id?: string | null
    code?: string | null
    name?: string | null
  } | null
  model_plan?: {
    color?: string | null
    icon?: string | null
  } | null
  plan_feature_value?: {
    data?: FeatureValueRow[]
  } | null
}

type OrderedFeature = PlanFeature & { order: number }

const FALLBACK_COLOR = '#737373'
const ICON_RE = /^[a-z0-9_]+$/i
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export const PLAN_FEATURE_FIELDS = [
  'displayValue',
  'booleanValue',
  'stringValue',
  'dateValue',
  'integerValue',
  'numberValue',
  'linkValue',
  'fromDate',
  'toDate',
  {
    benefit_feature: {
      fields: ['code', 'name', 'description', 'displayOrder', 'isVisible'],
    },
  },
] as const

export const PLAN_CARD_FIELDS = [
  'id',
  'code',
  'name',
  'description',
  'displayOrder',
  { benefit: { fields: ['id', 'code', 'name'] } },
  { model_plan: { fields: ['color', 'icon'] } },
  { plan_feature_value: { fields: [...PLAN_FEATURE_FIELDS] } },
] as const

const featureValue = (row: FeatureValueRow) => {
  if (row.displayValue) return row.displayValue
  const value =
    row.stringValue ?? row.integerValue ?? row.numberValue ?? row.linkValue
  return value == null ? null : String(value)
}

const formatDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date)
}

export const todayUtc = () => new Date().toISOString().slice(0, 10)

const toFeature = (row: FeatureValueRow, today: string): OrderedFeature | null => {
  const feature = row.benefit_feature
  if (!feature?.name || feature.isVisible === false) return null
  if (
    !row.fromDate ||
    !row.toDate ||
    row.fromDate.slice(0, 10) > today ||
    row.toDate.slice(0, 10) <= today
  ) {
    return null
  }

  const details = {
    code: feature.code || feature.name,
    name: feature.name,
    description: feature.description?.trim() || null,
    order: feature.displayOrder ?? 0,
  }
  if (row.booleanValue != null) {
    return { ...details, type: 'boolean', value: row.booleanValue }
  }
  if (row.dateValue) {
    return { ...details, type: 'date', value: formatDate(row.dateValue) }
  }
  const value = featureValue(row)
  return value ? { ...details, type: 'text', value } : null
}

export const toCard = (row: PlanRow, today: string): PlanCard | null => {
  if (!row.id || !row.code) return null
  const color = row.model_plan?.color
  const icon = row.model_plan?.icon?.trim() ?? null
  const features = (row.plan_feature_value?.data ?? [])
    .map((value) => toFeature(value, today))
    .filter((feature): feature is OrderedFeature => feature !== null)
    .sort((left, right) => left.order - right.order)
    .map(({ order: _, ...feature }) => feature)

  return {
    id: row.id,
    code: row.code,
    name: row.name?.trim() || row.code,
    description: row.description?.trim() || null,
    color: color && isBrandColor(color) ? color : FALLBACK_COLOR,
    icon: icon && ICON_RE.test(icon) ? icon : null,
    features,
  }
}