function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map<number, number>()
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1)
  return [...freq.keys()].sort((a, b) => freq.get(b)! - freq.get(a)!).slice(0, k)
}
