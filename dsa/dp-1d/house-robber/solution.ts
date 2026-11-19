function rob(nums: number[]): number {
  let twoBack = 0 // best over houses 0..i-2
  let oneBack = 0 // best over houses 0..i-1
  for (let i = 0; i < nums.length; i++) {
    // Skip house i, or rob it on top of the best that ends two houses back.
    const robIt = twoBack + nums[i]
    const current = robIt > oneBack ? robIt : oneBack
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}
