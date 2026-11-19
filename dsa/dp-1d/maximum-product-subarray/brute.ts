function maxProduct(nums: number[]): number {
  // Every subarray, extending the product as the end moves right: O(n^2).
  let best = nums[0]
  for (let start = 0; start < nums.length; start++) {
    let product = 1
    for (let end = start; end < nums.length; end++) {
      product *= nums[end]
      if (product > best) {
        best = product
      }
    }
  }
  return best === 0 ? 0 : best // turn -0 into 0
}
