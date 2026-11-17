interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

function throttle<A extends unknown[], R>(fn: (...args: A) => R, wait: number, options: ThrottleOptions = {}) {
  function throttled(this: unknown, ...args: A): R | undefined {
    // TODO
    return undefined
  }
  throttled.cancel = (): void => {
    // TODO
  }
  return throttled
}
