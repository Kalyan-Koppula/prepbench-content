function partial(fn: (...args: any[]) => unknown, ...presets: unknown[]) {
  return function (this: unknown, ...args: unknown[]): unknown {
    // TODO
    return undefined
  }
}

partial.placeholder = Symbol('partial.placeholder')
