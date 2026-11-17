function arrayFrom<T, U = T>(source: Iterable<T> | ArrayLike<T>, mapFn?: (value: T, index: number) => U, thisArg?: unknown): U[] {
  if (source === null || source === undefined) throw new TypeError('arrayFrom needs an iterable or array-like')
  if (mapFn !== undefined && typeof mapFn !== 'function') throw new TypeError('mapFn must be a function')
  const out: U[] = []
  const add = (value: T) => {
    const index = out.length
    out.push(mapFn ? mapFn.call(thisArg, value, index) : (value as unknown as U))
  }

  const obj = Object(source)
  if (typeof obj[Symbol.iterator] === 'function') {
    for (const value of obj as Iterable<T>) add(value)
    return out
  }

  const raw = Math.trunc(Number(obj.length))
  const length = Number.isFinite(raw) ? Math.max(0, raw) : raw > 0 ? Number.MAX_SAFE_INTEGER : 0
  for (let i = 0; i < length; i++) add(obj[i])
  return out
}
