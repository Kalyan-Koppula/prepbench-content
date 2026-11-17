type Spec = { [key: string]: unknown }

function applyCommand(value: unknown, command: string, arg: unknown): unknown {
  switch (command) {
    case '$set':
      return arg
    case '$apply':
      if (typeof arg !== 'function') throw new TypeError('$apply expects a function')
      return arg(value)
    case '$push':
      if (!Array.isArray(value)) throw new TypeError('$push target must be an array')
      if (!Array.isArray(arg)) throw new TypeError('$push expects an array of items')
      return [...value, ...arg]
    case '$merge':
      if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('$merge target must be an object')
      return { ...value, ...(arg as object) }
    default:
      throw new Error(`Unknown command ${command}`)
  }
}

function update<T>(state: T, spec: Spec): T {
  const keys = Object.keys(spec)
  if (keys.some((k) => k.startsWith('$'))) {
    if (keys.length !== 1) throw new Error(`A command must be alone in its spec object, got ${keys.join(', ')}`)
    return applyCommand(state, keys[0], spec[keys[0]]) as T
  }

  if (state === null || typeof state !== 'object') throw new TypeError(`Cannot update keys ${keys.join(', ')} of ${String(state)}`)
  const source = state as Record<string, unknown>
  let copy: Record<string, unknown> | null = null
  for (const key of keys) {
    const next = update(source[key], spec[key] as Spec)
    if (Object.is(next, source[key])) continue
    copy ??= (Array.isArray(source) ? [...source] : { ...source }) as Record<string, unknown>
    copy[key] = next
  }
  return (copy ?? state) as T
}
