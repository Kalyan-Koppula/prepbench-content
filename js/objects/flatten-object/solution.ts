function isContainer(value: unknown): value is Record<string, unknown> {
  if (Array.isArray(value)) return true
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function flattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const walk = (value: Record<string, unknown>, prefix: string) => {
    for (const key of Object.keys(value)) {
      const path = prefix ? `${prefix}.${key}` : key
      const child = value[key]
      if (isContainer(child) && Object.keys(child).length > 0) walk(child, path)
      else out[path] = child
    }
  }
  walk(obj, '')
  return out
}
