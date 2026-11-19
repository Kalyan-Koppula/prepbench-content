function findTargetSumWays(nums: number[], target: number): number {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    total += nums[i]
  }
  // Numbers with a plus sign sum to P, the rest to total - P.
  // P - (total - P) = target, so P = (total + target) / 2.
  if (Math.abs(target) > total || (total + target) % 2 !== 0) {
    return 0
  }
  const goal = (total + target) / 2

  // count[s] = number of subsets of the numbers seen so far that sum to s.
  const count = new Array(goal + 1).fill(0)
  count[0] = 1
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    for (let s = goal; s >= x; s--) {
      count[s] += count[s - x] // downward, so each number is used at most once
    }
  }
  return count[goal]
}
