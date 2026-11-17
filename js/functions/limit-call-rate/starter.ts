function rateLimit<A extends unknown[], R>(fn: (...args: A) => R, limit: number, windowMs: number) {
  return function (this: unknown, ...args: A): R | undefined {
    // TODO
    return undefined
  }
}
