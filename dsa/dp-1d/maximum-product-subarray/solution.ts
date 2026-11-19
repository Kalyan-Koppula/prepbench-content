function maxProduct(nums: number[]): number {
  // high / low = largest / smallest product of a subarray ending at index i.
  // The smallest matters because a negative number turns it into the largest.
  let high = nums[0]
  let low = nums[0]
  let best = nums[0]
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i]
    const a = high * x
    const b = low * x
    // Start fresh at x, or extend the previous high or low.
    let newHigh = x
    if (a > newHigh) {
      newHigh = a
    }
    if (b > newHigh) {
      newHigh = b
    }
    let newLow = x
    if (a < newLow) {
      newLow = a
    }
    if (b < newLow) {
      newLow = b
    }
    high = newHigh
    low = newLow
    if (high > best) {
      best = high
    }
  }
  return best
}
