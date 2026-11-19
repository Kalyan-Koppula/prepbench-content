function subsetsWithDup(nums: number[]): number[][] {
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b) // equal values side by side
  const result: number[][] = []
  const path: number[] = []

  function explore(start: number): void {
    result.push(path.slice())
    for (let i = start; i < sorted.length; i++) {
      // The same value as the previous choice at this level leads to the same subtree.
      if (i > start && sorted[i] === sorted[i - 1]) {
        continue
      }
      path.push(sorted[i])
      explore(i + 1)
      path.pop()
    }
  }

  explore(0)
  return result
}
