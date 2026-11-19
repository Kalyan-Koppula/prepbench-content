function findPeakElement(nums: number[]): number {
  // The first drop marks a peak; with no drop, the last element is one.
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] > nums[i + 1]) {
      return i
    }
  }
  return nums.length - 1
}
