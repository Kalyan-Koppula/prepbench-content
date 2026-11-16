function findMin(nums: number[]): number {
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    // mid is in the left (larger) run, so the drop is to its right
    if (nums[mid] > nums[hi]) lo = mid + 1
    else hi = mid
  }
  return nums[lo]
}
