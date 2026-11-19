function canPartition(nums: number[]): boolean {
  // Grow the set of every reachable subset sum (one number at a time).
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    total += nums[i]
  }
  if (total % 2 === 1) {
    return false
  }
  let sums = new Set<number>()
  sums.add(0)
  for (let i = 0; i < nums.length; i++) {
    const next = new Set<number>()
    for (const s of sums) {
      next.add(s)
      next.add(s + nums[i])
    }
    sums = next
  }
  return sums.has(total / 2)
}
