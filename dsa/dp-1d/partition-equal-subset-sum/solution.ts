function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0)
  if (total % 2 === 1) return false
  const target = total / 2

  // reach[s] = some subset of the numbers seen so far sums to s.
  const reach = new Array(target + 1).fill(false)
  reach[0] = true
  for (const x of nums) {
    // High to low so reach[s - x] still refers to the state before x.
    for (let s = target; s >= x; s--) {
      if (reach[s - x]) reach[s] = true
    }
    if (reach[target]) return true
  }
  return reach[target]
}
