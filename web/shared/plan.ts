export type PlanFeature = {
  code: string
  name: string
  value: string
}

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
