function memoize<A extends unknown[], R>(fn: (...args: A) => R, resolver?: (...args: A) => unknown) {
  function memoized(this: unknown, ...args: A): R {
    const key = resolver ? resolver.apply(this, args) : args[0]
    const cache = memoized.cache
    if (cache.has(key)) return cache.get(key) as R
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
  memoized.cache = new Map<unknown, R>()
  return memoized
}
