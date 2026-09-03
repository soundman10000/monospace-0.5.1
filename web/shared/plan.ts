type PlanFeatureBase = {
  code: string
  name: string
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
