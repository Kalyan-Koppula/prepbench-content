interface Diff {
  added: string[]
  removed: string[]
  changed: string[]
}

function containerKind(value: unknown): 'array' | 'object' | null {
  if (Array.isArray(value)) return 'array'
  if (value === null || typeof value !== 'object') return null
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null ? 'object' : null
}

function diff(before: Record<string, unknown>, after: Record<string, unknown>): Diff {
  const result: Diff = { added: [], removed: [], changed: [] }
  const has = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k)

  const walk = (a: Record<string, unknown>, b: Record<string, unknown>, prefix: string) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      const path = prefix ? `${prefix}.${key}` : key
      if (!has(a, key)) result.added.push(path)
      else if (!has(b, key)) result.removed.push(path)
      else {
        const kind = containerKind(a[key])
        if (kind && kind === containerKind(b[key])) walk(a[key] as Record<string, unknown>, b[key] as Record<string, unknown>, path)
        else if (!Object.is(a[key], b[key])) result.changed.push(path)
      }
    }
  }

  walk(before, after, '')
  return result
}
