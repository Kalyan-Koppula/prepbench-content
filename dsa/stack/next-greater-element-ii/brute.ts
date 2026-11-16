function nextGreaterElements(nums: number[]): number[] {
  const n = nums.length
  return nums.map((x, i) => {
    for (let step = 1; step < n; step++) if (nums[(i + step) % n] > x) return nums[(i + step) % n]
    return -1
  })
}
