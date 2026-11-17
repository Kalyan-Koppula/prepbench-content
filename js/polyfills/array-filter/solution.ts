function myFilter<T>(this: ArrayLike<T>, callback: (value: T, index: number, array: ArrayLike<T>) => unknown, thisArg?: unknown): T[] {
  if (typeof callback !== 'function') throw new TypeError(`${String(callback)} is not a function`)
  const source = Object(this)
  const length = Math.max(0, Math.trunc(Number(source.length)) || 0)
  const result: T[] = []
  for (let i = 0; i < length; i++) {
    if (!(i in source)) continue
    const value = source[i]
    if (callback.call(thisArg, value, i, source)) result.push(value)
  }
  return result
}
