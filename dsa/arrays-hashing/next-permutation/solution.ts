function nextPermutation(nums: number[]): void {
  const reverse = (from: number) => {
    for (let l = from, r = nums.length - 1; l < r; l++, r--) [nums[l], nums[r]] = [nums[r], nums[l]]
  }

  let i = nums.length - 2
  while (i >= 0 && nums[i] >= nums[i + 1]) i--
  if (i >= 0) {
    // smallest value to the right that is still larger than nums[i]
    let j = nums.length - 1
    while (nums[j] <= nums[i]) j--
    ;[nums[i], nums[j]] = [nums[j], nums[i]]
  }
  reverse(i + 1) // suffix is non-increasing; reversing makes it ascending
}
