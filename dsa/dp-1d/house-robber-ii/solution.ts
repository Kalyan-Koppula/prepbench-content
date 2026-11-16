function rob(nums: number[]): number {
  const n = nums.length
  if (n === 1) return nums[0]

  // Straight-row House Robber on nums[lo..hi].
  const robRange = (lo: number, hi: number) => {
    let prev2 = 0
    let prev1 = 0
    for (let i = lo; i <= hi; i++) {
      const cur = Math.max(prev1, prev2 + nums[i])
      prev2 = prev1
      prev1 = cur
    }
    return prev1
  }

  // House 0 and house n-1 can't both be taken: drop one of them.
  return Math.max(robRange(0, n - 2), robRange(1, n - 1))
}
