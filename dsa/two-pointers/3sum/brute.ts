function threeSum(nums: number[]): number[][] {
  const n = nums.length
  const seen = new Set<string>()
  const result: number[][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        if (nums[i] + nums[j] + nums[k] !== 0) {
          continue
        }
        // Sort the three values so every ordering of a triplet gets the same key.
        const triplet = [nums[i], nums[j], nums[k]]
        triplet.sort((a, b) => a - b)
        const key = triplet[0] + ',' + triplet[1] + ',' + triplet[2]
        if (!seen.has(key)) {
          seen.add(key)
          result.push(triplet)
        }
      }
    }
  }
  return result
}
