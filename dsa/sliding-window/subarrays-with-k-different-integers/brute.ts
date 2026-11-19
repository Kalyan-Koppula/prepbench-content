function subarraysWithKDistinct(nums: number[], k: number): number {
  let total = 0
  for (let start = 0; start < nums.length; start++) {
    const seen = new Set<number>()
    for (let end = start; end < nums.length; end++) {
      seen.add(nums[end])
      if (seen.size === k) {
        total++
      } else if (seen.size > k) {
        break // extending further only adds values
      }
    }
  }
  return total
}
