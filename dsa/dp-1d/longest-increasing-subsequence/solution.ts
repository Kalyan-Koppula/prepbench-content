function lengthOfLIS(nums: number[]): number {
  // tails[k] = smallest tail value of any increasing subsequence of length k + 1.
  const tails: number[] = []
  for (const x of nums) {
    // First index whose tail is >= x (strictly increasing => replace equal values).
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < x) lo = mid + 1
      else hi = mid
    }
    tails[lo] = x // extends the longest run when lo === tails.length
  }
  return tails.length
}
