function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length
  const result = new Array(n).fill(-1)
  for (let i = 0; i < n; i++) {
    // Look at the next n - 1 positions, wrapping around.
    for (let step = 1; step < n; step++) {
      const candidate = nums[(i + step) % n]
      if (candidate > nums[i]) {
        result[i] = candidate
        break
      }
    }
  }
  return result
}
