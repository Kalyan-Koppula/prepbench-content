function stringifyQuery(params: Record<string, unknown>): string {
  const pairs: string[] = []

  const add = (key: string, value: unknown) => {
    if (value === undefined) return
    if (Array.isArray(value)) {
      for (const item of value) add(key, item)
    } else if (Object.prototype.toString.call(value) === '[object Date]') {
      pairs.push(`${key}=${encodeURIComponent((value as Date).toISOString())}`)
    } else if (value !== null && typeof value === 'object') {
      for (const child of Object.keys(value)) add(`${key}[${encodeURIComponent(child)}]`, (value as Record<string, unknown>)[child])
    } else {
      pairs.push(`${key}=${value === null ? '' : encodeURIComponent(String(value))}`)
    }
  }

  for (const key of Object.keys(params)) add(encodeURIComponent(key), params[key])
  return pairs.join('&')
}
