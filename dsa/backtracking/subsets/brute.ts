function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    result.push(nums.filter((_, i) => mask & (1 << i)))
  }
  return result
}
