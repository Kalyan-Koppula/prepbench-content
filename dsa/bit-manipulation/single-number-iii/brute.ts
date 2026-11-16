function singleNumber(nums: number[]): number[] {
  const count = new Map<number, number>()
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1)
  return [...count].filter(([, c]) => c === 1).map(([x]) => x)
}
