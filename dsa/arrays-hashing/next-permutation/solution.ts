function nextPermutation(nums: number[]): void {
  const n = nums.length

  // The pivot is the rightmost i with nums[i] < nums[i + 1].
  // Everything after it is non-increasing, so that suffix cannot grow by itself.
  let pivot = n - 2
  while (pivot >= 0 && nums[pivot] >= nums[pivot + 1]) {
    pivot--
  }

  if (pivot >= 0) {
    // The suffix is non-increasing, so the first value from the right that beats
    // the pivot is the smallest such value (and the rightmost copy of it).
    let swapWith = n - 1
    while (nums[swapWith] <= nums[pivot]) {
      swapWith--
    }
    const temp = nums[pivot]
    nums[pivot] = nums[swapWith]
    nums[swapWith] = temp
  }

  // The suffix is still non-increasing; reversing it makes it the smallest arrangement.
  // With no pivot this reverses the whole array, which wraps to ascending order.
  let left = pivot + 1
  let right = n - 1
  while (left < right) {
    const temp = nums[left]
    nums[left] = nums[right]
    nums[right] = temp
    left++
    right--
  }
}
