type AnyFn = (...args: any[]) => any

function sameList(a: unknown[] | null, b: unknown[]): boolean {
  return a !== null && a.length === b.length && a.every((x, i) => Object.is(x, b[i]))
}

function createSelector(...args: Array<AnyFn | AnyFn[]>) {
  const resultFn = args.pop() as AnyFn
  const inputs = (args.length === 1 && Array.isArray(args[0]) ? args[0] : args) as AnyFn[]

  let lastArgs: unknown[] | null = null
  let lastInputs: unknown[] | null = null
  let lastResult: unknown
  let recomputations = 0

  const selector = (...callArgs: unknown[]): unknown => {
    if (sameList(lastArgs, callArgs)) return lastResult
    lastArgs = callArgs
    const values = inputs.map((input) => input(...callArgs))
    if (sameList(lastInputs, values)) return lastResult
    lastInputs = values
    recomputations++
    lastResult = resultFn(...values)
    return lastResult
  }
  selector.recomputations = () => recomputations
  selector.resetRecomputations = () => {
    recomputations = 0
  }
  return selector
}
