function majorityElement(nums: number[]): number {
  let candidate = nums[0]
  let count = 0
  for (const x of nums) {
    if (count === 0) candidate = x
    count += x === candidate ? 1 : -1
  }
  return candidate
}
