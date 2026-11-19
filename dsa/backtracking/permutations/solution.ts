function permute(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []
  const used = new Array(nums.length).fill(false)

  function explore(): void {
    if (path.length === nums.length) {
      result.push(path.slice())
      return
    }
    // Any element not used yet can go in the next position.
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        continue
      }
      used[i] = true
      path.push(nums[i])
      explore()
      path.pop()
      used[i] = false
    }
  }

  explore()
  return result
}
