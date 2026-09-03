import type {
  CmsBlock,
  CmsLayoutBlock,
  CmsMarkdownBlock,
  CmsTitleBlock,
  PlanCoveragePage,
} from '#shared/plan'
import { isUuid } from './id'
import { getMonospace } from './monospace'

type Monospace = ReturnType<typeof getMonospace>

type TitleRow = {
  id?: string | null
  text?: string | null
  style?: string | null
}

type MarkdownRow = {
  id?: string | null
  text?: string | null
}

type JunctionRow = {
  id?: string | null
  collection?: string | null
  item?: string | null
  sort?: number | null
}

type LayoutRow = {
  id?: string | null
  layout?: string | null
  layout_grid_container_blocks?: { data?: JunctionRow[] } | JunctionRow[] | null
}

type PageRow = {
  id?: string | null
  code?: string | null
  title?: string | null
  description?: string | null
  layout?: string | null
  block_title?: TitleRow | null
  block_markdown?: MarkdownRow | null
  layout_grid_container?: { id?: string | null } | null
}

const TITLE_STYLE_RE = /^h[1-5]$/i
const LAYOUT_RE = /^[1-4]x[1-6]$/i

const asList = <T>(value: { data?: T[] } | T[] | null | undefined): T[] => {
  if (Array.isArray(value)) return value
  return value?.data ?? []
}

const uniqueIds = (values: Array<string | null | undefined>) =>
  [...new Set(values.filter((value): value is string => !!value && isUuid(value)))]

const toTitle = (row: TitleRow | null | undefined): CmsTitleBlock | null => {
  if (!row?.id || !row.text?.trim()) return null
  const style = row.style?.trim().toLowerCase() ?? ''
  return {
    collection: 'block_title',
    id: row.id,
    text: row.text.trim(),
    style: TITLE_STYLE_RE.test(style) ? style : 'h2',
  }
}

const toMarkdown = (row: MarkdownRow | null | undefined): CmsMarkdownBlock | null => {
  if (!row?.id || !row.text?.trim()) return null
  return {
    collection: 'block_markdown',
    id: row.id,
    text: row.text,
  }
}

const readByIds = async <T extends { id?: string | null }>(
  client: Monospace,
  collection: string,
  ids: string[],
  fields: string[],
) => {
  const map = new Map<string, T>()
  if (!ids.length) return map
  const rows = await client.$readMany<T>(collection, {
    fields,
    filter: { id: { _in: ids } },
    limit: ids.length,
  })
  for (const row of rows) {
    if (row.id) map.set(row.id, row)
  }
  return map
}

const loadLayoutTree = async (
  client: Monospace,
  rootId: string,
): Promise<CmsLayoutBlock | null> => {
  const layouts = new Map<string, LayoutRow>()
  const junctions = new Map<string, JunctionRow[]>()
  const pending = [rootId]

  while (pending.length) {
    const batch = uniqueIds(pending.splice(0)).filter((id) => !layouts.has(id))
    if (!batch.length) continue

    const rows = await client.$readMany<LayoutRow>('layoutGridContainer', {
      fields: [
        'id',
        'layout',
        {
          layout_grid_container_blocks: {
            fields: ['id', 'collection', 'item', 'sort'],
            sort: ['sort'],
          },
        },
      ],
      filter: { id: { _in: batch } },
      limit: batch.length,
    })

    for (const row of rows) {
      if (!row.id) continue
      layouts.set(row.id, row)
      const blocks = asList(row.layout_grid_container_blocks)
        .slice()
        .sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0))
      junctions.set(row.id, blocks)
      for (const block of blocks) {
        if (block.collection === 'layout_grid_container' && block.item) {
          pending.push(block.item)
        }
      }
    }
  }

  const titleIds: string[] = []
  const markdownIds: string[] = []
  for (const blocks of junctions.values()) {
    for (const block of blocks) {
      if (!block.item) continue
      if (block.collection === 'block_title') titleIds.push(block.item)
      if (block.collection === 'block_markdown') markdownIds.push(block.item)
    }
  }

  const titles = await readByIds<TitleRow>(
    client,
    'blockTitle',
    uniqueIds(titleIds),
    ['id', 'text', 'style'],
  )
  const markdowns = await readByIds<MarkdownRow>(
    client,
    'blockMarkdown',
    uniqueIds(markdownIds),
    ['id', 'text'],
  )

  const assemble = (layoutId: string, seen: Set<string>): CmsLayoutBlock | null => {
    if (seen.has(layoutId)) return null
    seen.add(layoutId)
    const layout = layouts.get(layoutId)
    if (!layout?.id) return null
    const kind = layout.layout?.trim() ?? ''
    const blocks = (junctions.get(layoutId) ?? [])
      .map((block) => toBlock(block, seen))
      .filter((block): block is CmsBlock => block !== null)

    return {
      collection: 'layout_grid_container',
      id: layout.id,
      layout: LAYOUT_RE.test(kind) ? kind : '1x1',
      blocks,
    }
  }

  const toBlock = (row: JunctionRow, seen: Set<string>): CmsBlock | null => {
    if (!row.item) return null
    if (row.collection === 'block_title') return toTitle(titles.get(row.item))
    if (row.collection === 'block_markdown') return toMarkdown(markdowns.get(row.item))
    if (row.collection === 'layout_grid_container') return assemble(row.item, seen)
    return null
  }

  return assemble(rootId, new Set())
}

export const loadCoverage = async (planId: string): Promise<PlanCoveragePage | null> => {
  const client = getMonospace()
  const page = await client.$readFirst<PageRow>('pagePlanInfo', {
    fields: [
      'id',
      'code',
      'title',
      'description',
      'layout',
      { block_title: { fields: ['id', 'text', 'style'] } },
      { block_markdown: { fields: ['id', 'text'] } },
      { layout_grid_container: { fields: ['id'] } },
    ],
    filter: { plan: { _eq: planId } },
  })
  if (!page?.id) return null

  let title = toTitle(page.block_title)
  if (!title && page.title && isUuid(page.title)) {
    const rows = await readByIds<TitleRow>(client, 'blockTitle', [page.title], [
      'id',
      'text',
      'style',
    ])
    title = toTitle(rows.get(page.title))
  }

  let description = toMarkdown(page.block_markdown)
  if (!description && page.description && isUuid(page.description)) {
    const rows = await readByIds<MarkdownRow>(client, 'blockMarkdown', [page.description], [
      'id',
      'text',
    ])
    description = toMarkdown(rows.get(page.description))
  }

  const layoutId = page.layout_grid_container?.id || page.layout
  const layout =
    layoutId && isUuid(layoutId) ? await loadLayoutTree(client, layoutId) : null

  return {
    id: page.id,
    code: page.code?.trim() || page.id,
    title,
    description,
    layout,
  }
}