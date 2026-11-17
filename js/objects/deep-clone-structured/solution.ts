function cloneDeep<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value
  const src = value as unknown as object
  if (seen.has(src)) return seen.get(src) as T

  if (src instanceof Date) return new Date(src.getTime()) as T
  if (src instanceof RegExp) return new RegExp(src.source, src.flags) as T

  if (src instanceof Map) {
    const out = new Map()
    seen.set(src, out)
    for (const [k, v] of src) out.set(cloneDeep(k, seen), cloneDeep(v, seen))
    return out as T
  }
  if (src instanceof Set) {
    const out = new Set()
    seen.set(src, out)
    for (const item of src) out.add(cloneDeep(item, seen))
    return out as T
  }

  const out: Record<PropertyKey, unknown> = Array.isArray(src) ? new Array(src.length) : Object.create(Object.getPrototypeOf(src))
  seen.set(src, out)
  for (const key of Reflect.ownKeys(src)) {
    if (!Object.prototype.propertyIsEnumerable.call(src, key)) continue
    out[key] = cloneDeep((src as Record<PropertyKey, unknown>)[key], seen)
  }
  return out as T
}
