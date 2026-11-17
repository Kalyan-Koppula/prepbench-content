function createRateLimiter(limit: number, windowMs: number) {
  return function schedule<T>(task: () => T | PromiseLike<T>): Promise<T> {
    // TODO
  }
}
