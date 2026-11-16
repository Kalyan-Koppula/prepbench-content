function longestConsecutive(nums: number[]): number {
  const sorted = [...new Set(nums)].sort((a, b) => a - b)
  let best = 0
  let run = 0
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1
    best = Math.max(best, run)
  }
  return best
}
