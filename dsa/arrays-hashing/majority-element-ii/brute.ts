function majorityElement(nums: number[]): number[] {
  const freq = new Map<number, number>()
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1)
  return [...freq].filter(([, c]) => c > Math.floor(nums.length / 3)).map(([v]) => v)
}
