function maxProduct(nums: number[]): number {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let product = 1
    for (let j = i; j < nums.length; j++) {
      product *= nums[j]
      best = Math.max(best, product)
    }
  }
  return best === 0 ? 0 : best
}
