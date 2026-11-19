function longestZeroSumSubarray(nums: number[]): number {
  let best = 0
  for (let start = 0; start < nums.length; start++) {
    // Extend the end one step at a time, keeping the sum instead of recomputing it.
    let sum = 0
    for (let end = start; end < nums.length; end++) {
      sum += nums[end]
      if (sum === 0 && end - start + 1 > best) {
        best = end - start + 1
      }
    }
  }
  return best
}
