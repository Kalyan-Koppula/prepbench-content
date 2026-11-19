function lengthOfLIS(nums: number[]): number {
  // O(n^2): length[i] = longest increasing subsequence that ends at i.
  const length = new Array(nums.length).fill(1)
  let best = 1
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i] && length[j] + 1 > length[i]) {
        length[i] = length[j] + 1
      }
    }
    if (length[i] > best) {
      best = length[i]
    }
  }
  return best
}
