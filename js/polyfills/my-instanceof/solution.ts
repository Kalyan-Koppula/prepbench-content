function myInstanceof(value: unknown, Constructor: Function): boolean {
  if (typeof Constructor !== 'function') throw new TypeError("Right-hand side of 'instanceof' is not callable")
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false
  const target = Constructor.prototype
  let proto = Object.getPrototypeOf(value)
  while (proto !== null) {
    if (proto === target) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
