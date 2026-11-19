function singleNonDuplicate(nums: number[]): number {
  // Walk the pairs; the first pair that doesn't match starts with the single value.
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (nums[i] !== nums[i + 1]) {
      return nums[i]
    }
  }
  return nums[nums.length - 1]
}
