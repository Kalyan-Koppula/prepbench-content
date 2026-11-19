function productExceptSelf(nums: number[]): number[] {
  const n = nums.length
  const answer = new Array(n).fill(1)
  for (let i = 0; i < n; i++) {
    let product = 1
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        product *= nums[j]
      }
    }
    answer[i] = product
  }
  return answer
}
