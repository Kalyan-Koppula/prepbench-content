function myApply(this: Function, thisArg: unknown, argsArray?: ArrayLike<unknown> | null): unknown {
  if (typeof this !== 'function') throw new TypeError('myApply must be called on a function')
  let args: unknown[] = []
  if (argsArray !== null && argsArray !== undefined) {
    if (typeof argsArray !== 'object' && typeof argsArray !== 'function') throw new TypeError('argsArray must be an array-like object')
    const length = Math.max(0, Math.min(Number(argsArray.length) || 0, 2 ** 32 - 1))
    args = new Array(length)
    for (let i = 0; i < length; i++) args[i] = argsArray[i]
  }
  const ctx: any = thisArg === null || thisArg === undefined ? globalThis : Object(thisArg)
  const key = Symbol('fn')
  Object.defineProperty(ctx, key, { value: this, configurable: true })
  try {
    return ctx[key](...args)
  } finally {
    delete ctx[key]
  }
}
