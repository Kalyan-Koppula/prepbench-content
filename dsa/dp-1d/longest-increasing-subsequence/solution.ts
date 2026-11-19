function lengthOfLIS(nums: number[]): number {
  // tails[k] = smallest possible last value of an increasing subsequence of
  // length k + 1 seen so far. tails is always strictly increasing.
  const tails: number[] = []
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    // Binary search for the first tail >= x.
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      if (tails[mid] < x) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    if (lo === tails.length) {
      tails.push(x) // x extends the longest subsequence
    } else {
      tails[lo] = x // x is a smaller tail for subsequences of length lo + 1
    }
  }
  return tails.length
}
