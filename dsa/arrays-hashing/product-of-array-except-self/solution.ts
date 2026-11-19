function productExceptSelf(nums: number[]): number[] {
  const n = nums.length
  const answer = new Array(n).fill(1)

  // Left pass: answer[i] becomes the product of nums[0..i-1].
  let leftProduct = 1
  for (let i = 0; i < n; i++) {
    answer[i] = leftProduct
    leftProduct *= nums[i]
  }

  // Right pass: multiply in the product of nums[i+1..n-1]. Reading answer[i]
  // before nums[i] joins rightProduct keeps index i itself out of it.
  let rightProduct = 1
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= rightProduct
    rightProduct *= nums[i]
  }
  return answer
}
