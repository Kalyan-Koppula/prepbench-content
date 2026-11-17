function memoizeOne<A extends unknown[], R>(fn: (...args: A) => R, isEqual?: (newArgs: A, lastArgs: A) => boolean) {
  function memoized(this: unknown, ...args: A): R {
    // TODO
    return undefined as R
  }
  memoized.clear = (): void => {
    // TODO
  }
  return memoized
}
