function subarraySum(nums: number[], k: number): number {
  // prefixCount[s] = how many prefixes seen so far have sum s.
  const prefixCount = new Map<number, number>()
  prefixCount.set(0, 1) // the empty prefix, so subarrays starting at index 0 count
  let sum = 0
  let total = 0

  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    // A subarray ending at i sums to k when an earlier prefix sums to sum - k.
    const matches = prefixCount.get(sum - k)
    if (matches !== undefined) {
      total += matches
    }
    // Record the current prefix after the lookup, so a subarray is never empty.
    const seen = prefixCount.get(sum)
    if (seen === undefined) {
      prefixCount.set(sum, 1)
    } else {
      prefixCount.set(sum, seen + 1)
    }
  }
  return total
}
