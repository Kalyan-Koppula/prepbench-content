function longestOnes(nums: number[], k: number): number {
  let best = 0
  for (let start = 0; start < nums.length; start++) {
    let zeros = 0
    for (let end = start; end < nums.length; end++) {
      if (nums[end] === 0) {
        zeros++
      }
      if (zeros > k) {
        break // every longer window from this start also has too many zeros
      }
      if (end - start + 1 > best) {
        best = end - start + 1
      }
    }
  }
  return best
}
