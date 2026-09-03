type PlanFeatureBase = {
  code: string
  name: string
  description: string | null
}

export type PlanFeature = PlanFeatureBase & (
  | { type: 'boolean', value: boolean }
  | { type: 'date' | 'text', value: string }
)

export type PlanCard = {
  id: string
  code: string
  name: string
  description: string | null
  color: string
  icon: string | null
  features: PlanFeature[]
}

export type PlansResult = {
  benefitCode: string
  plans: PlanCard[]
}

export type PlanBenefit = {
  id: string
  code: string
  name: string
}

export type CmsTitleBlock = {
  collection: 'block_title'
  id: string
  text: string
  style: string
}

export type CmsMarkdownBlock = {
  collection: 'block_markdown'
  id: string
  text: string
}

export type CmsLayoutBlock = {
  collection: 'layout_grid_container'
  id: string
  layout: string
  blocks: CmsBlock[]
}

export type CmsBlock = CmsTitleBlock | CmsMarkdownBlock | CmsLayoutBlock

export type PlanCoveragePage = {
  id: string
  code: string
  title: CmsTitleBlock | null
  description: CmsMarkdownBlock | null
  layout: CmsLayoutBlock | null
}

export type PlanDetail = PlanCard & {
  benefit: PlanBenefit
  coverage: PlanCoveragePage | null
}
