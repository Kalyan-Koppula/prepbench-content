function myCall(this: Function, thisArg: unknown, ...args: unknown[]): unknown {
  if (typeof this !== 'function') throw new TypeError('myCall must be called on a function')
  const ctx: any = thisArg === null || thisArg === undefined ? globalThis : Object(thisArg)
  const key = Symbol('fn')
  Object.defineProperty(ctx, key, { value: this, configurable: true })
  try {
    return ctx[key](...args)
  } finally {
    delete ctx[key]
  }
}
