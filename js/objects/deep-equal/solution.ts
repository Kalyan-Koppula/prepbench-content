function deepEqual(a: unknown, b: unknown): boolean {
  // Pairs currently being compared further up the recursion.
  const inProgress: [object, object][] = []

  function eq(x: unknown, y: unknown): boolean {
    if (x === y || (x !== x && y !== y)) return true // SameValueZero
    if (typeof x !== 'object' || typeof y !== 'object' || x === null || y === null) return false
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false
    if (inProgress.some(([p, q]) => p === x && q === y)) return true

    inProgress.push([x, y])
    const result = compare(x, y)
    inProgress.pop()
    return result
  }

  function compare(x: object, y: object): boolean {
    if (x instanceof Date) return eq(x.getTime(), (y as Date).getTime())
    if (x instanceof RegExp) return x.source === (y as RegExp).source && x.flags === (y as RegExp).flags
    if (x instanceof Map) {
      const other = y as Map<unknown, unknown>
      if (x.size !== other.size) return false
      for (const [k, v] of x) if (!other.has(k) || !eq(v, other.get(k))) return false
      return true
    }
    if (x instanceof Set) {
      if (x.size !== (y as Set<unknown>).size) return false
      const unmatched = [...(y as Set<unknown>)]
      for (const item of x) {
        const i = unmatched.findIndex((candidate) => eq(item, candidate))
        if (i === -1) return false
        unmatched.splice(i, 1)
      }
      return true
    }
    if (Array.isArray(x)) {
      const other = y as unknown[]
      if (x.length !== other.length) return false
      return x.every((item, i) => eq(item, other[i]))
    }
    const xKeys = Object.keys(x)
    const yKeys = Object.keys(y)
    if (xKeys.length !== yKeys.length) return false
    return xKeys.every(
      (k) => Object.prototype.hasOwnProperty.call(y, k) && eq((x as Record<string, unknown>)[k], (y as Record<string, unknown>)[k]),
    )
  }

  return eq(a, b)
}
