function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const segments = (text: string) => text.split('/').filter(Boolean)
  const patternParts = segments(pattern)
  const pathParts = segments(path.split(/[?#]/)[0])
  const params: Record<string, string> = {}

  try {
    for (let i = 0; i < patternParts.length; i++) {
      const part = patternParts[i]
      const value = pathParts[i]
      if (part === '*') {
        params['*'] = pathParts.slice(i).map(decodeURIComponent).join('/')
        return params
      }
      if (part.startsWith(':')) {
        const optional = part.endsWith('?')
        const name = part.slice(1, optional ? -1 : undefined)
        if (value === undefined) {
          if (optional) continue
          return null
        }
        params[name] = decodeURIComponent(value)
      } else if (part !== value) {
        return null
      }
    }
  } catch {
    return null // malformed percent-encoding
  }
  return pathParts.length > patternParts.length ? null : params
}
