function myReduce<T, U>(this: ArrayLike<T>, callback: (acc: U, value: T, index: number, array: ArrayLike<T>) => U, ...initial: [U?]): U {
  if (typeof callback !== 'function') throw new TypeError(`${String(callback)} is not a function`)
  const source = Object(this)
  const length = Math.max(0, Math.trunc(Number(source.length)) || 0)
  let i = 0
  let acc: U
  if (initial.length > 0) {
    acc = initial[0] as U
  } else {
    while (i < length && !(i in source)) i++
    if (i >= length) throw new TypeError('Reduce of empty array with no initial value')
    acc = source[i++]
  }
  for (; i < length; i++) {
    if (i in source) acc = callback(acc, source[i], i, source)
  }
  return acc
}
