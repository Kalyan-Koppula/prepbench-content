function missingNumber(nums: number[]): number {
  let acc = nums.length // the index range is 0..n-1, so seed with n
  for (let i = 0; i < nums.length; i++) acc ^= i ^ nums[i]
  return acc
}
