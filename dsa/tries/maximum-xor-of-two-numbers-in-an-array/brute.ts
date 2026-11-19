function findMaximumXOR(nums: number[]): number {
  // Every pair: O(n^2).
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const x = nums[i] ^ nums[j] // both are below 2^31, so this is non-negative
      if (x > best) {
        best = x
      }
    }
  }
  return best
}
