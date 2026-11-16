function longestZeroSumSubarray(nums: number[]): number {
  const first = new Map<number, number>([[0, -1]]) // prefix sum -> earliest index
  let sum = 0
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    const earlier = first.get(sum)
    if (earlier !== undefined) best = Math.max(best, i - earlier)
    else first.set(sum, i)
  }
  return best
}
