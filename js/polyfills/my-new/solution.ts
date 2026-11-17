function myNew(Constructor: Function, ...args: unknown[]): any {
  if (typeof Constructor !== 'function') throw new TypeError(`${String(Constructor)} is not a constructor`)
  const proto = Constructor.prototype
  const instance = Object.create(proto !== null && (typeof proto === 'object' || typeof proto === 'function') ? proto : Object.prototype)
  const result = Constructor.apply(instance, args)
  const isObject = result !== null && (typeof result === 'object' || typeof result === 'function')
  return isObject ? result : instance
}
