function canPartition(nums: number[]): boolean {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    total += nums[i]
  }
  if (total % 2 === 1) {
    return false // two equal halves need an even total
  }
  const target = total / 2
  // reachable[s] = some subset of the numbers seen so far adds up to s.
  const reachable = new Array(target + 1).fill(false)
  reachable[0] = true
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    // Go from high to low so reachable[s - x] still describes subsets without x
    // (each number is used at most once).
    for (let s = target; s >= x; s--) {
      if (reachable[s - x]) {
        reachable[s] = true
      }
    }
    if (reachable[target]) {
      return true
    }
  }
  return reachable[target]
}
