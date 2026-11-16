function subarraySum(nums: number[], k: number): number {
  const counts = new Map<number, number>([[0, 1]]) // empty prefix
  let sum = 0
  let total = 0
  for (const x of nums) {
    sum += x
    total += counts.get(sum - k) ?? 0
    counts.set(sum, (counts.get(sum) ?? 0) + 1)
  }
  return total
}
