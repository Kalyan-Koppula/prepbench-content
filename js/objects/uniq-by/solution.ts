function uniqBy<T>(array: T[], by: string | ((item: T) => unknown)): T[] {
  const keyOf = typeof by === 'function' ? by : (item: T) => (item as Record<string, unknown>)[by]
  const seen = new Set<unknown>()
  const out: T[] = []
  for (const item of array) {
    const key = keyOf(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}
