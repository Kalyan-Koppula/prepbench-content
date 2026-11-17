const SKIPPED_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

// `target` is always an object this function created, so writing to it is safe.
function mergeInto(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key of Object.keys(source)) {
    if (SKIPPED_KEYS.has(key)) continue
    const incoming = source[key]
    if (incoming === undefined) continue
    if (isPlainObject(incoming)) {
      const existing = target[key]
      target[key] = mergeInto(isPlainObject(existing) ? existing : {}, incoming)
    } else {
      target[key] = incoming
    }
  }
  return target
}

function deepMerge(...sources: Array<Record<string, unknown> | null | undefined>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const source of sources) if (source) mergeInto(result, source)
  return result
}
