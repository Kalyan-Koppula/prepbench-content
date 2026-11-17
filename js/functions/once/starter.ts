function once<A extends unknown[], R>(fn: (...args: A) => R) {
  return function (this: unknown, ...args: A): R | undefined {
    // TODO
    return undefined
  }
}
