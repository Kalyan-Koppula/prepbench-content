function myBind(this: Function, thisArg: unknown, ...presets: unknown[]) {
  const target = this
  if (typeof target !== 'function') throw new TypeError('myBind must be called on a function')

  return function bound(this: unknown, ...args: unknown[]): unknown {
    const allArgs = [...presets, ...args]
    if (new.target) {
      const proto = target.prototype
      const instance = Object.create(proto !== null && typeof proto === 'object' ? proto : Object.prototype)
      const result = target.apply(instance, allArgs)
      return result !== null && (typeof result === 'object' || typeof result === 'function') ? result : instance
    }
    return target.apply(thisArg, allArgs)
  }
}
