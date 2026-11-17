const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

function set<T extends object>(obj: T, path: string | Array<string | number>, value: unknown): T {
  const keys = (Array.isArray(path) ? path : (path.match(/[^.[\]]+/g) ?? [])).map(String)
  if (keys.length === 0 || keys.some((k) => UNSAFE_KEYS.has(k))) return obj

  let current = obj as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const next = current[key]
    if (next === null || (typeof next !== 'object' && typeof next !== 'function')) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    }
    current = current[key] as Record<string, unknown>
  }
  current[keys[keys.length - 1]] = value
  return obj
}
