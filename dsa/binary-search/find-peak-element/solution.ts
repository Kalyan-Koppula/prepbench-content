function findPeakElement(nums: number[]): number {
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    // Uphill to the right: a peak must exist in (mid, hi]
    if (nums[mid] < nums[mid + 1]) lo = mid + 1
    else hi = mid
  }
  return lo
}
