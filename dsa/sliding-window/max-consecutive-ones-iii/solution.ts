function longestOnes(nums: number[], k: number): number {
  let left = 0
  let zeros = 0 // zeros inside the window = flips the window needs
  let best = 0
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) {
      zeros++
    }
    // Too many zeros to flip: shrink from the left until we're back to k.
    while (zeros > k) {
      if (nums[left] === 0) {
        zeros--
      }
      left++
    }
    const length = right - left + 1
    if (length > best) {
      best = length
    }
  }
  return best
}
