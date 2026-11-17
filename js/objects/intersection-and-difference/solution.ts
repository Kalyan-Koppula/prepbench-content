function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  const [first, ...rest] = arrays
  const sets = rest.map((a) => new Set(a))
  const emitted = new Set<T>()
  const out: T[] = []
  for (const value of first) {
    if (emitted.has(value) || !sets.every((s) => s.has(value))) continue
    emitted.add(value)
    out.push(value)
  }
  return out
}

function difference<T>(array: T[], ...others: T[][]): T[] {
  const excluded = new Set<T>()
  for (const other of others) for (const value of other) excluded.add(value)
  return array.filter((value) => !excluded.has(value))
}
