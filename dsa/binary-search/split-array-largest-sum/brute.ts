function splitArray(nums: number[], k: number): number {
  // dp[i] = best largest-piece sum for the first i elements using the current number of pieces
  const n = nums.length
  const prefix = [0]
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x)
  let dp = prefix.map((s, i) => (i === 0 ? 0 : s)) // one piece
  for (let pieces = 2; pieces <= k; pieces++) {
    const next = new Array(n + 1).fill(Infinity)
    for (let i = pieces; i <= n; i++) {
      for (let p = pieces - 1; p < i; p++) {
        next[i] = Math.min(next[i], Math.max(dp[p], prefix[i] - prefix[p]))
      }
    }
    dp = next
  }
  return dp[n]
}
