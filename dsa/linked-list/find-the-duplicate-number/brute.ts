function findDuplicate(nums: number[]): number {
  // Binary search on the value: count how many numbers are <= mid.
  // If more than mid, the duplicate is in [1, mid]. O(n log n), O(1) space.
  let lo = 1
  let hi = nums.length - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    let count = 0
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] <= mid) {
        count++
      }
    }
    if (count > mid) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}
