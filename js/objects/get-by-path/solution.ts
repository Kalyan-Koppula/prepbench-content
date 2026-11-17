function get(obj: unknown, path: string | Array<string | number>, defaultValue?: unknown): unknown {
  // 'a.b[0].c' -> ['a', 'b', '0', 'c']: every run of characters that isn't '.', '[' or ']'.
  const keys = Array.isArray(path) ? path : (path.match(/[^.[\]]+/g) ?? [])
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue
    current = (current as Record<string | number, unknown>)[key]
  }
  return current === undefined ? defaultValue : current
}
