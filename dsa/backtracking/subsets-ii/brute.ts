function subsetsWithDup(nums: number[]): number[][] {
  // Generate all 2^n subsets of the sorted array and keep each distinct one once.
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b)
  const seen = new Set<string>()
  const result: number[][] = []
  const path: number[] = []

  function explore(i: number): void {
    if (i === sorted.length) {
      const key = path.join(',')
      if (!seen.has(key)) {
        seen.add(key)
        result.push(path.slice())
      }
      return
    }
    explore(i + 1) // skip sorted[i]
    path.push(sorted[i]) // take sorted[i]
    explore(i + 1)
    path.pop()
  }

  explore(0)
  return result
}
