function curry(fn: (...args: any[]) => unknown) {
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) return fn(...args)
    return (...more: unknown[]) => curried(...args, ...more)
  }
}
