function productExceptSelf(nums: number[]): number[] {
  const n = nums.length
  const answer = new Array<number>(n)

  let left = 1
  for (let i = 0; i < n; i++) {
    answer[i] = left // product of nums[0..i-1]
    left *= nums[i]
  }

  let right = 1
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right // times product of nums[i+1..n-1]
    right *= nums[i]
  }
  return answer
}
