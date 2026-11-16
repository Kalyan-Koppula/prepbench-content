function subarraysWithKDistinct(nums: number[], k: number): number {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set<number>()
    for (let j = i; j < nums.length; j++) {
      seen.add(nums[j])
      if (seen.size === k) total++
      else if (seen.size > k) break
    }
  }
  return total
}
