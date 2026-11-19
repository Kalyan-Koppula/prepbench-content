function singleNumber(nums: number[]): number {
  let result = 0
  for (let i = 0; i < nums.length; i++) {
    result ^= nums[i] // x ^ x = 0, so every pair cancels out
  }
  return result
}
