function findMin(nums: number[]): number {
  // Invariant: the minimum is in [lo, hi].
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] > nums[hi]) {
      lo = mid + 1 // mid is in the left (larger) run, so the drop is to its right
    } else {
      hi = mid // mid..hi is ascending, so the minimum is mid or to its left
    }
  }
  return nums[lo]
}
