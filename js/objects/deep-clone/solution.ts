function deepClone<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => deepClone(item)) as T
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      out[key] = deepClone((value as Record<string, unknown>)[key])
    }
    return out as T
  }
  return value
}
