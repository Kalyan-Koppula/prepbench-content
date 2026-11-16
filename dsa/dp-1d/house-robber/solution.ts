function rob(nums: number[]): number {
  // prev1 = best over houses [0..i-1], prev2 = best over [0..i-2].
  let prev2 = 0
  let prev1 = 0
  for (const cash of nums) {
    const cur = Math.max(prev1, prev2 + cash)
    prev2 = prev1
    prev1 = cur
  }
  return prev1
}
