const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const withInline = (value: string) =>
  escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

const isListItem = (line: string) => /^[-*]\s+/.test(line)

export const markdownToHtml = (source: string) => {
  const blocks = source.replaceAll('\r\n', '\n').trim().split(/\n{2,}/)
  return blocks
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trimEnd())
      if (lines.length && lines.every((line) => !line || isListItem(line))) {
        const items = lines
          .filter(isListItem)
          .map((line) => `<li>${withInline(line.replace(/^[-*]\s+/, ''))}</li>`)
          .join('')
        return items ? `<ul>${items}</ul>` : ''
      }
      return `<p>${lines.map((line) => withInline(line)).join('<br>')}</p>`
    })
    .join('')
}