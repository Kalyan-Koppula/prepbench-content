function dedupe<A extends unknown[], R>(fn: (...args: A) => R | PromiseLike<R>, getKey: (...args: A) => unknown = (...args) => JSON.stringify(args)) {
  const inFlight = new Map<unknown, Promise<R>>()

  return function (this: unknown, ...args: A): Promise<R> {
    const key = getKey(...args)
    const existing = inFlight.get(key)
    if (existing) return existing

    let result: Promise<R>
    try {
      result = Promise.resolve(fn.apply(this, args))
    } catch (error) {
      return Promise.reject(error)
    }
    // Clean up first; callers subscribe to `shared`, so they run after the delete.
    const shared = result.finally(() => inFlight.delete(key))
    inFlight.set(key, shared)
    return shared
  }
}
