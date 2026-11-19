function findPeakElement(nums: number[]): number {
  // Invariant: [lo, hi] always contains a peak.
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] < nums[mid + 1]) {
      lo = mid + 1 // going uphill to the right: a peak lies in (mid, hi]
    } else {
      hi = mid // going downhill: mid itself or something left of it is a peak
    }
  }
  return lo
}
