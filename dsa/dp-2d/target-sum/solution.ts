function findTargetSumWays(nums: number[], target: number): number {
  const total = nums.reduce((a, b) => a + b, 0)
  // Plus-set sum P satisfies 2P = total + target.
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0
  const goal = (total + target) / 2

  // count[s] = number of subsets (of the numbers so far) with sum s.
  const count = new Array(goal + 1).fill(0)
  count[0] = 1
  for (const x of nums) {
    for (let s = goal; s >= x; s--) count[s] += count[s - x] // downward: each number once
  }
  return count[goal]
}
