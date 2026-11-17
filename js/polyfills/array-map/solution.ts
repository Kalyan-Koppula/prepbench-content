function myMap<T, U>(this: ArrayLike<T>, callback: (value: T, index: number, array: ArrayLike<T>) => U, thisArg?: unknown): U[] {
  if (typeof callback !== 'function') throw new TypeError(`${String(callback)} is not a function`)
  const source = Object(this)
  const length = Math.max(0, Math.trunc(Number(source.length)) || 0)
  const result = new Array<U>(length)
  for (let i = 0; i < length; i++) {
    if (i in source) result[i] = callback.call(thisArg, source[i], i, source)
  }
  return result
}
