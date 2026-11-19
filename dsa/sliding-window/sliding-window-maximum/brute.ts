function maxSlidingWindow(nums: number[], k: number): number[] {
  const result: number[] = []
  for (let start = 0; start + k <= nums.length; start++) {
    let max = nums[start]
    for (let i = start + 1; i < start + k; i++) {
      if (nums[i] > max) {
        max = nums[i]
      }
    }
    result.push(max)
  }
  return result
}
