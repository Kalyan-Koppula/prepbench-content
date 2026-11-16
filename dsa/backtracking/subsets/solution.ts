function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []

  const backtrack = (start: number) => {
    result.push([...path]) // every node of the tree is a subset
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1)
      path.pop()
    }
  }

  backtrack(0)
  return result
}
