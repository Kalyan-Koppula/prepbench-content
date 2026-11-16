function subsetsWithDup(nums: number[]): number[][] {
  const seen = new Map<string, number[]>()
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    const subset = nums.filter((_, i) => mask & (1 << i)).sort((a, b) => a - b)
    seen.set(subset.join(','), subset)
  }
  return [...seen.values()]
}
