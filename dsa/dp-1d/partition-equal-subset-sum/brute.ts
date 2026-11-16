// Grow the set of every achievable subset sum, then look for half the total.
function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0)
  let sums = new Set<number>([0])
  for (const x of nums) {
    const next = new Set(sums)
    for (const s of sums) next.add(s + x)
    sums = next
  }
  return total % 2 === 0 && sums.has(total / 2)
}
