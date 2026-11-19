function majorityElement(nums: number[]): number {
  // Boyer-Moore voting: pair off different values; the majority survives.
  let candidate = nums[0]
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    if (count === 0) {
      candidate = nums[i]
    }
    if (nums[i] === candidate) {
      count++
    } else {
      count--
    }
  }
  return candidate
}
