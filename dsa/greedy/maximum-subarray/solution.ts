function maxSubArray(nums: number[]): number {
  let cur = nums[0]
  let best = nums[0]
  for (let i = 1; i < nums.length; i++) {
    // A negative running sum only drags the next element down — restart.
    cur = Math.max(nums[i], cur + nums[i])
    best = Math.max(best, cur)
  }
  return best
}
