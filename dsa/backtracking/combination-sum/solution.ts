function combinationSum(candidates: number[], target: number): number[][] {
  const sorted = candidates.slice()
  sorted.sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []

  function explore(start: number, remaining: number): void {
    if (remaining === 0) {
      result.push(path.slice())
      return
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) {
        break // sorted: every later candidate is too big as well
      }
      path.push(sorted[i])
      explore(i, remaining - sorted[i]) // i, not i + 1: the same candidate may be reused
      path.pop()
    }
  }

  explore(0, target)
  return result
}
