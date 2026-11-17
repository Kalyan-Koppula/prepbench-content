function dedupe<A extends unknown[], R>(fn: (...args: A) => R | PromiseLike<R>, getKey: (...args: A) => unknown = (...args) => JSON.stringify(args)) {
  return function (this: unknown, ...args: A): Promise<R> {
    // TODO
  }
}
