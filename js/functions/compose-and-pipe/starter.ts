type AnyFn = (...args: any[]) => any

function pipe(...fns: AnyFn[]) {
  return function (this: unknown, ...args: unknown[]): unknown {
    // TODO
    return undefined
  }
}

function compose(...fns: AnyFn[]) {
  return function (this: unknown, ...args: unknown[]): unknown {
    // TODO
    return undefined
  }
}
