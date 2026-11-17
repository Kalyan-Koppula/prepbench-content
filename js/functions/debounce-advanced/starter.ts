interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

function debounce<A extends unknown[], R>(fn: (...args: A) => R, wait: number, options: DebounceOptions = {}) {
  function debounced(this: unknown, ...args: A): R | undefined {
    // TODO
    return undefined
  }
  debounced.cancel = (): void => {
    // TODO
  }
  debounced.flush = (): R | undefined => {
    // TODO
    return undefined
  }
  return debounced
}
