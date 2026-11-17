type AnyFn = (...args: any[]) => any

function pipe(...fns: AnyFn[]) {
  return function (this: unknown, ...args: unknown[]): unknown {
    if (fns.length === 0) return args[0]
    const [first, ...rest] = fns
    return rest.reduce((value, f) => f.call(this, value), first.apply(this, args))
  }
}

function compose(...fns: AnyFn[]) {
  return pipe(...fns.slice().reverse())
}
