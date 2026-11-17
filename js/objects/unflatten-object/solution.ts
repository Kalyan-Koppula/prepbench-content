const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])

function unflattenObject(flat: Record<string, unknown>): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  // Containers this function created; only these may be walked through.
  const built = new WeakSet<object>([root])

  for (const flatKey of Object.keys(flat)) {
    const parts = flatKey.split('.')
    if (parts.some((p) => BLOCKED_SEGMENTS.has(p))) continue

    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!Object.prototype.hasOwnProperty.call(node, part)) {
        const child = /^\d+$/.test(parts[i + 1]) ? [] : {}
        built.add(child)
        node[part] = child
      } else if (!built.has(node[part] as object)) {
        throw new Error(`Conflict at "${flatKey}": "${parts.slice(0, i + 1).join('.')}" already holds a value`)
      }
      node = node[part] as Record<string, unknown>
    }

    const last = parts[parts.length - 1]
    if (Object.prototype.hasOwnProperty.call(node, last) && built.has(node[last] as object)) {
      throw new Error(`Conflict at "${flatKey}": it would replace nested keys`)
    }
    node[last] = flat[flatKey]
  }
  return root
}
