function combinationSum(candidates: number[], target: number): number[][] {
  const sorted = [...candidates].sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []

  const backtrack = (start: number, remaining: number) => {
    if (remaining === 0) {
      result.push([...path])
      return
    }
    for (let i = start; i < sorted.length; i++) {
      if (sorted[i] > remaining) break // sorted, so every later candidate is too big
      path.push(sorted[i])
      backtrack(i, remaining - sorted[i]) // i, not i + 1: reuse is allowed
      path.pop()
    }
  }

  backtrack(0, target)
  return result
}
