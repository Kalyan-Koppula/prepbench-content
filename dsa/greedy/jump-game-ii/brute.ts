function jump(nums: number[]): number {
  const n = nums.length
  const dp: number[] = new Array(n).fill(Infinity)
  dp[0] = 0
  for (let i = 0; i < n; i++) {
    for (let s = 1; s <= nums[i] && i + s < n; s++) {
      dp[i + s] = Math.min(dp[i + s], dp[i] + 1)
    }
  }
  return dp[n - 1]
}
