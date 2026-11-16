function combinationSum2(candidates: number[], target: number): number[][] {
  const sorted = [...candidates].sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []

  const backtrack = (start: number, remaining: number) => {
    if (remaining === 0) {
      result.push([...path])
      return
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break
      // Using a second copy of the same value at this level repeats a subtree.
      if (i > start && sorted[i] === sorted[i - 1]) continue
      path.push(sorted[i])
      backtrack(i + 1, remaining - sorted[i])
      path.pop()
    }
  }

  backtrack(0, target)
  return result
}
