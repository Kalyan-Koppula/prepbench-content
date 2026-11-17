function curry(fn: (...args: any[]) => unknown) {
  return function curried(...args: unknown[]): unknown {
    // TODO
    return undefined
  }
}

curry.placeholder = Symbol('curry.placeholder')
