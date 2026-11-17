function sameArgs(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    const y = b[i]
    if (x !== y && !(x !== x && y !== y)) return false
  }
  return true
}

function memoizeOne<A extends unknown[], R>(fn: (...args: A) => R, isEqual?: (newArgs: A, lastArgs: A) => boolean) {
  let last: { ctx: unknown; args: A; result: R } | undefined

  function memoized(this: unknown, ...args: A): R {
    if (last && last.ctx === this && (isEqual ? isEqual(args, last.args) : sameArgs(args, last.args))) return last.result
    const result = fn.apply(this, args)
    last = { ctx: this, args, result }
    return result
  }

  memoized.clear = (): void => {
    last = undefined
  }

  return memoized
}
