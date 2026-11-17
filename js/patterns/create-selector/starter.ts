type AnyFn = (...args: any[]) => any

function createSelector(...args: Array<AnyFn | AnyFn[]>) {
  // TODO
  const selector = (...callArgs: unknown[]): unknown => undefined
  selector.recomputations = () => 0
  selector.resetRecomputations = () => {}
  return selector
}
