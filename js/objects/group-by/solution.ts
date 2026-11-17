function groupBy<T>(items: Iterable<T>, by: string | ((item: T, index: number) => unknown)): Record<string, T[]> {
  const keyOf = typeof by === 'function' ? by : (item: T) => (item as Record<string, unknown>)[by]
  const groups: Record<string, T[]> = Object.create(null)
  let index = 0
  for (const item of items) {
    const key = String(keyOf(item, index++))
    ;(groups[key] ??= []).push(item)
  }
  return groups
}
