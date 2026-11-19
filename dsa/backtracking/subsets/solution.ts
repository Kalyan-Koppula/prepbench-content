function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []

  // Every node of the decision tree is a subset; children add a later element.
  function explore(start: number): void {
    result.push(path.slice())
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]) // choose
      explore(i + 1)
      path.pop() // un-choose
    }
  }

  explore(0)
  return result
}
