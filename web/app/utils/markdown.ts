import { Marked, type Tokens } from 'marked'

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const isSafeHref = (href: string) => /^(https?:|mailto:)/i.test(href.trim())

const renderer = {
  html() {
    return ''
  },
  link({ href, title, text }: Tokens.Link) {
    if (!href || !isSafeHref(href)) return text
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`
  },
  image({ text }: Tokens.Image) {
    return escapeHtml(text || '')
  },
}

const chatMarked = new Marked({
  gfm: true,
  breaks: true,
  renderer,
})

const pageMarked = new Marked({
  gfm: true,
  breaks: false,
  renderer,
})

export const markdownToHtml = (source: string, options?: { breaks?: boolean }) => {
  const parser = options?.breaks ? chatMarked : pageMarked
  return parser.parse(source, { async: false }) as string
}
