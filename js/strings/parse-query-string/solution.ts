function decodePart(text: string): string {
  const spaced = text.replace(/\+/g, ' ')
  try {
    return decodeURIComponent(spaced)
  } catch {
    return spaced
  }
}

function parseQuery(query: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {}
  const body = query.startsWith('?') ? query.slice(1) : query
  for (const piece of body.split('&')) {
    if (!piece) continue
    const eq = piece.indexOf('=')
    const key = decodePart(eq === -1 ? piece : piece.slice(0, eq))
    const value = eq === -1 ? '' : decodePart(piece.slice(eq + 1))
    if (!key) continue
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      // defineProperty works for '__proto__' too, where plain assignment would not.
      Object.defineProperty(result, key, { value, writable: true, enumerable: true, configurable: true })
    } else {
      const existing = result[key]
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    }
  }
  return result
}
