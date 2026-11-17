const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function lookup(data: unknown, path: string): unknown {
  let current = data
  for (const key of path.split('.')) {
    if (current === null || current === undefined) return undefined
    if (!Object.prototype.hasOwnProperty.call(Object(current), key)) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  const PATH = '[\\w$]+(?:\\.[\\w$]+)*'
  const placeholder = new RegExp(`\\{\\{\\{\\s*(${PATH})\\s*\\}\\}\\}|\\{\\{\\s*(${PATH})\\s*\\}\\}`, 'g')
  return template.replace(placeholder, (_match, rawPath: string | undefined, escapedPath: string | undefined) => {
    const value = lookup(data, (rawPath ?? escapedPath)!)
    if (value === null || value === undefined) return ''
    const text = String(value)
    return rawPath !== undefined ? text : text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
  })
}
