function once<A extends unknown[], R>(fn: (...args: A) => R) {
  let started = false
  let result: R | undefined

  return function (this: unknown, ...args: A): R | undefined {
    if (started) return result
    started = true
    try {
      result = fn.apply(this, args)
    } catch (e) {
      started = false
      throw e
    }
    return result
  }
}
