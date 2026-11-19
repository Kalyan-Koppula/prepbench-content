function sortColors(nums: number[]): void {
  // [0, low) holds 0s, [low, mid) holds 1s, (high, n - 1] holds 2s.
  // [mid, high] is the part not yet examined.
  let low = 0
  let mid = 0
  let high = nums.length - 1

  while (mid <= high) {
    if (nums[mid] === 0) {
      const temp = nums[low]
      nums[low] = nums[mid]
      nums[mid] = temp
      // The value that came from low was already examined (it is a 1), so mid can move on.
      low++
      mid++
    } else if (nums[mid] === 1) {
      mid++
    } else {
      const temp = nums[high]
      nums[high] = nums[mid]
      nums[mid] = temp
      // The value that came from high has not been examined yet, so mid stays.
      high--
    }
  }
}
