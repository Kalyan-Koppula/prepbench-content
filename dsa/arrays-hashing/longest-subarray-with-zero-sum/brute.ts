function longestZeroSumSubarray(nums: number[]): number {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (sum === 0) best = Math.max(best, j - i + 1)
    }
  }
  return best
}
