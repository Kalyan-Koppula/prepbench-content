function combinationSum2(candidates: number[], target: number): number[][] {
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
        break
      }
      // A second copy of the same value at this level would repeat a subtree.
      if (i > start && sorted[i] === sorted[i - 1]) {
        continue
      }
      path.push(sorted[i])
      explore(i + 1, remaining - sorted[i]) // each position used at most once
      path.pop()
    }
  }

  explore(0, target)
  return result
}
