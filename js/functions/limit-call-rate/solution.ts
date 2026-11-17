function rateLimit<A extends unknown[], R>(fn: (...args: A) => R, limit: number, windowMs: number) {
  const allowed: number[] = []

  return function (this: unknown, ...args: A): R | undefined {
    const now = Date.now()
    while (allowed.length && allowed[0] <= now - windowMs) allowed.shift()
    if (allowed.length >= limit) return undefined
    allowed.push(now)
    return fn.apply(this, args)
  }
}
