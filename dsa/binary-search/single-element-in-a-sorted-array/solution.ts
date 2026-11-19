function singleNonDuplicate(nums: number[]): number {
  // Before the single value, pairs start at even indices; after it, at odd ones.
  let lo = 0
  let hi = nums.length - 1
  while (lo < hi) {
    let mid = lo + Math.floor((hi - lo) / 2)
    if (mid % 2 === 1) {
      mid-- // look at the pair that should start at an even index
    }
    if (nums[mid] === nums[mid + 1]) {
      lo = mid + 2 // the pair is intact, so the single value is further right
    } else {
      hi = mid // the pattern is already broken: answer is mid or to its left
    }
  }
  return nums[lo]
}
