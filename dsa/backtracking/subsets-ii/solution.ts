function subsetsWithDup(nums: number[]): number[][] {
  const sorted = [...nums].sort((a, b) => a - b)
  const result: number[][] = []
  const path: number[] = []

  const backtrack = (start: number) => {
    result.push([...path])
    for (let i = start; i < sorted.length; i++) {
      // Same value as the previous choice at this level → same subtree.
      if (i > start && sorted[i] === sorted[i - 1]) continue
      path.push(sorted[i])
      backtrack(i + 1)
      path.pop()
    }
  }

  backtrack(0)
  return result
}
