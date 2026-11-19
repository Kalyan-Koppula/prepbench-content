function search(nums: number[], target: number): number {
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (nums[mid] === target) {
      return mid
    }
    // At least one half of [lo, hi] is sorted; test the target against that half.
    if (nums[lo] <= nums[mid]) {
      // Left half [lo, mid] is sorted.
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    } else {
      // Right half [mid, hi] is sorted.
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
  }
  return -1
}
