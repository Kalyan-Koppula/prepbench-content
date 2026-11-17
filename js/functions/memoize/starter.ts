function memoize<A extends unknown[], R>(fn: (...args: A) => R, resolver?: (...args: A) => unknown) {
  function memoized(this: unknown, ...args: A): R {
    // TODO
    return undefined as R
  }
  memoized.cache = new Map<unknown, R>()
  return memoized
}
