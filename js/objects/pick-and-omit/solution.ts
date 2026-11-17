const hasOwn = (o: unknown, k: string) => o !== null && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k)

function pick(obj: Record<string, unknown>, paths: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const path of paths) {
    const parts = path.split('.')
    // Walk the source first so missing paths leave no trace in the result.
    let value: unknown = obj
    let found = true
    for (const p of parts) {
      if (!hasOwn(value, p)) {
        found = false
        break
      }
      value = (value as Record<string, unknown>)[p]
    }
    if (!found) continue

    let dst = out
    for (const p of parts.slice(0, -1)) {
      if (!hasOwn(dst, p)) dst[p] = {}
      dst = dst[p] as Record<string, unknown>
    }
    dst[parts[parts.length - 1]] = value
  }
  return out
}

function withoutPath(o: Record<string, unknown>, parts: string[]): Record<string, unknown> {
  const [head, ...rest] = parts
  if (!hasOwn(o, head)) return o
  if (rest.length === 0) {
    const copy = { ...o }
    delete copy[head]
    return copy
  }
  const child = o[head]
  if (child === null || typeof child !== 'object') return o
  const nextChild = withoutPath(child as Record<string, unknown>, rest)
  return nextChild === child ? o : { ...o, [head]: nextChild }
}

function omit(obj: Record<string, unknown>, paths: string[]): Record<string, unknown> {
  return paths.reduce((acc, path) => withoutPath(acc, path.split('.')), { ...obj })
}
