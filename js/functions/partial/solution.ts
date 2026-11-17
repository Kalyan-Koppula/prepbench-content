function partial(fn: (...args: any[]) => unknown, ...presets: unknown[]) {
  return function (this: unknown, ...args: unknown[]): unknown {
    let next = 0
    const filled = presets.map((p) => (p === partial.placeholder ? args[next++] : p))
    return fn.apply(this, filled.concat(args.slice(next)))
  }
}

partial.placeholder = Symbol('partial.placeholder')
