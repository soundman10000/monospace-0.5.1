import type {
  CmsBlock,
  CmsCardBlock,
  CmsDocumentBlock,
  CmsMarkdownBlock,
  PlanCoveragePage,
} from '#shared/plan'
import { loadCoverage } from '../coverage'
import { isUuid } from '../id'
import { getMonospace } from '../monospace'
import type { ChatTool, ChatToolCall } from './provider'

const MAX_RESULT = 24_000
const PAGE_LIMIT = 100

const CMS_SCHEMA = {
  purpose: 'Assembled Directus coverage pages (cards, copy, documents). Use these tools instead of reconstructing the nest with list_items.',
  tree: {
    plan: 'plan',
    page: 'pagePlanInfo (one coverage page per plan)',
    intro: ['blockTitle via title', 'blockMarkdown via description'],
    layout: 'layoutGridContainer',
    cells: ['layoutCardContainer', 'layoutDocumentsContainer', 'nested layoutGridContainer'],
    card: ['blockTitle', 'blockMarkdown', 'blockDocument'],
  },
  tools: {
    list_coverage_pages: 'Find coverage pages by plan or benefit.',
    read_plan_coverage: 'Return the page nest: title, description, cards, documents.',
  },
}

type CmsToolContext = {
  planId?: string
  benefitId?: string
}

type PageRow = {
  id?: string | null
  code?: string | null
  plan?: {
    id?: string | null
    code?: string | null
    name?: string | null
    benefitId?: string | null
    benefit?: { id?: string | null; code?: string | null; name?: string | null } | null
  } | null
  block_title?: { text?: string | null } | null
}

type PlanRow = {
  id?: string | null
  code?: string | null
  name?: string | null
  benefitId?: string | null
  benefit?: { id?: string | null; code?: string | null; name?: string | null } | null
}

type CoverageDocument = {
  code: string
  description: string | null
}

type CoverageCard = {
  title: string | null
  body: string | null
  documents: CoverageDocument[]
}

const stringify = (value: unknown): string => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (text.length <= MAX_RESULT) return text
  return `${text.slice(0, MAX_RESULT)}\n…truncated`
}

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

const asUuid = (value: unknown): string | null => {
  const text = asString(value)
  return text && isUuid(text) ? text : null
}

const parseArgs = (call: ChatToolCall): Record<string, unknown> => {
  if (!call.arguments.trim()) return {}
  try {
    const parsed = JSON.parse(call.arguments)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

const toDocuments = (blocks: CmsDocumentBlock[]): CoverageDocument[] =>
  blocks.map((block) => ({
    code: block.code,
    description: block.description,
  }))

const flattenCard = (card: CmsCardBlock): CoverageCard => {
  const title = card.blocks.find((block) => block.collection === 'block_title')
  const body = card.blocks
    .filter((block): block is CmsMarkdownBlock => block.collection === 'block_markdown')
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join('\n\n')
  const documents = toDocuments(
    card.blocks.filter((block): block is CmsDocumentBlock => block.collection === 'block_document'),
  )
  return {
    title: title && title.collection === 'block_title' ? title.text : null,
    body: body || null,
    documents,
  }
}

const flattenCoverage = (page: PlanCoveragePage, plan: PlanRow | null) => {
  const cards: CoverageCard[] = []
  const documents: CoverageDocument[] = []

  const visit = (block: CmsBlock) => {
    if (block.collection === 'layout_card_container') {
      const card = flattenCard(block)
      if (card.title || card.body || card.documents.length) cards.push(card)
      return
    }
    if (block.collection === 'layout_documents_container') {
      documents.push(...toDocuments(block.documents))
      return
    }
    if (block.collection === 'layout_grid_container') {
      for (const child of block.blocks) visit(child)
    }
  }

  if (page.layout) visit(page.layout)

  return {
    plan: plan
      ? {
          id: plan.id ?? null,
          code: plan.code ?? null,
          name: plan.name ?? null,
          benefitId: plan.benefit?.id ?? plan.benefitId ?? null,
          benefitCode: plan.benefit?.code ?? null,
          benefitName: plan.benefit?.name ?? null,
        }
      : null,
    page: {
      id: page.id,
      code: page.code,
      title: page.title?.text ?? null,
      description: page.description?.text ?? null,
    },
    cards,
    documents,
  }
}

const PLAN_FIELDS = [
  'id',
  'code',
  'name',
  'benefitId',
  { benefit: { fields: ['id', 'code', 'name'] } },
] as const

const PAGE_FIELDS = [
  'id',
  'code',
  { plan: { fields: [...PLAN_FIELDS] } },
  { block_title: { fields: ['text'] } },
] as const

export const createCmsTools = (context: CmsToolContext = {}): {
  tools: ChatTool[]
  execute: (call: ChatToolCall) => Promise<string>
} => {
  const client = getMonospace()

  const tools: ChatTool[] = [
    {
      name: 'read_cms_schema',
      description:
        'Map of Directus coverage collections and how they nest (plan → page → grid → cards). Call this before walking coverage data.',
      parameters: { type: 'object', properties: {} },
    },
    {
      name: 'list_coverage_pages',
      description:
        'List coverage pages with plan and benefit ids. Filter with planId, planCode, or benefitId. Defaults to the current page when those are omitted.',
      parameters: {
        type: 'object',
        properties: {
          planId: { type: 'string', description: 'Plan UUID' },
          planCode: { type: 'string', description: 'Plan code, e.g. medical-basic' },
          benefitId: { type: 'string', description: 'Benefit UUID, to list every plan page under that benefit' },
        },
      },
    },
    {
      name: 'read_plan_coverage',
      description:
        'Return the assembled coverage page for a plan: intro title and markdown, then each card (title, body, documents). Pass planId or planCode. If omitted, uses the plan currently on screen.',
      parameters: {
        type: 'object',
        properties: {
          planId: { type: 'string', description: 'Plan UUID' },
          planCode: { type: 'string', description: 'Plan code, e.g. medical-basic' },
        },
      },
    },
  ]

  const readPlan = async (id: string) =>
    client.$readFirst<PlanRow>('plan', {
      fields: [...PLAN_FIELDS],
      filter: { id: { _eq: id } },
    })

  const findPlanId = async (args: Record<string, unknown>, fallbackPlanId?: string) => {
    const planId = asUuid(args.planId) ?? fallbackPlanId ?? null
    if (planId) return planId
    const planCode = asString(args.planCode)
    if (!planCode) return null
    const plan = await client.$readFirst<PlanRow>('plan', {
      fields: ['id'],
      filter: { code: { _eq: planCode } },
    })
    return plan?.id ?? null
  }

  const listPages = async (args: Record<string, unknown>) => {
    const filter: Record<string, unknown> = {}
    const benefitIdArg = asUuid(args.benefitId)
    const planId = await findPlanId(
      args,
      benefitIdArg || asString(args.planCode) ? undefined : context.planId,
    )
    const benefitId = benefitIdArg ?? (!planId && !asString(args.planCode) ? context.benefitId : null)

    if (planId) {
      filter.plan = { _eq: planId }
    } else if (benefitId) {
      const plans = await client.$readMany<PlanRow>('plan', {
        fields: ['id'],
        filter: { benefitId: { _eq: benefitId } },
        limit: PAGE_LIMIT,
      })
      const ids = plans.map((plan) => plan.id).filter((id): id is string => Boolean(id))
      if (!ids.length) return []
      filter.plan = { _in: ids }
    }

    const rows = await client.$readMany<PageRow>('pagePlanInfo', {
      fields: [...PAGE_FIELDS],
      ...(Object.keys(filter).length ? { filter } : {}),
      limit: PAGE_LIMIT,
    })

    return rows
      .map((row) => ({
        pageId: row.id ?? null,
        pageCode: row.code ?? null,
        title: row.block_title?.text ?? null,
        planId: row.plan?.id ?? null,
        planCode: row.plan?.code ?? null,
        planName: row.plan?.name ?? null,
        benefitId: row.plan?.benefit?.id ?? row.plan?.benefitId ?? null,
        benefitCode: row.plan?.benefit?.code ?? null,
        benefitName: row.plan?.benefit?.name ?? null,
      }))
      .sort((left, right) =>
        `${left.benefitCode ?? ''} ${left.planCode ?? ''}`.localeCompare(
          `${right.benefitCode ?? ''} ${right.planCode ?? ''}`,
        ),
      )
  }

  const execute = async (call: ChatToolCall): Promise<string> => {
    try {
      if (call.name === 'read_cms_schema') return stringify(CMS_SCHEMA)

      if (call.name === 'list_coverage_pages') {
        return stringify(await listPages(parseArgs(call)))
      }

      if (call.name === 'read_plan_coverage') {
        const planId = await findPlanId(parseArgs(call), context.planId)
        if (!planId) {
          return stringify({
            error: 'Provide planId or planCode, or open a plan page.',
          })
        }
        const [plan, coverage] = await Promise.all([readPlan(planId), loadCoverage(planId)])
        if (!coverage) return stringify({ error: 'No coverage page for this plan', planId })
        return stringify(flattenCoverage(coverage, plan))
      }

      return stringify({ error: `Unknown CMS tool ${call.name}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CMS tool failed'
      return stringify({ error: message })
    }
  }

  return { tools, execute }
}
