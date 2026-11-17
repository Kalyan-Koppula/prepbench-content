function throttle<A extends unknown[]>(fn: (...args: A) => unknown, wait: number) {
  function throttled(this: unknown, ...args: A): void {
    // TODO
  }
  return throttled
}
