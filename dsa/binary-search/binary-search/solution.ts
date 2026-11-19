function search(nums: number[], target: number): number {
  // Invariant: if target is in nums, its index is in [lo, hi].
  let lo = 0
  let hi = nums.length - 1
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2) // avoids overflow in fixed-width languages
    if (nums[mid] === target) {
      return mid
    }
    if (nums[mid] < target) {
      lo = mid + 1 // target can only be to the right
    } else {
      hi = mid - 1 // target can only be to the left
    }
  }
  return -1
}
