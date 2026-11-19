function subsets(nums: number[]): number[][] {
  // Iterative: start with [[]]; each element doubles the list by being added to every existing subset.
  const result: number[][] = [[]]
  for (let i = 0; i < nums.length; i++) {
    const count = result.length
    for (let j = 0; j < count; j++) {
      const extended = result[j].slice()
      extended.push(nums[i])
      result.push(extended)
    }
  }
  return result
}
