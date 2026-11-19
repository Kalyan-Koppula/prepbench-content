function fourSum(nums: number[], target: number): number[][] {
  const n = nums.length
  const seen = new Set<string>()
  const result: number[][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let m = k + 1; m < n; m++) {
          if (nums[i] + nums[j] + nums[k] + nums[m] !== target) {
            continue
          }
          // Sorted values give one key per distinct quadruplet.
          const quad = [nums[i], nums[j], nums[k], nums[m]]
          quad.sort((a, b) => a - b)
          const key = quad[0] + ',' + quad[1] + ',' + quad[2] + ',' + quad[3]
          if (!seen.has(key)) {
            seen.add(key)
            result.push(quad)
          }
        }
      }
    }
  }
  return result
}
