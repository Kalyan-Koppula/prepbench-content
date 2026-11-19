function missingNumber(nums: number[]): number {
  const n = nums.length
  // XOR every index 0..n and every value: each present number appears twice
  // and cancels, leaving only the missing one.
  let result = n
  for (let i = 0; i < n; i++) {
    result ^= i
    result ^= nums[i]
  }
  return result
}
