function singleNonDuplicate(nums: number[]): number {
  const count = new Map<number, number>()
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1)
  for (const [x, c] of count) if (c === 1) return x
  return -1
}
