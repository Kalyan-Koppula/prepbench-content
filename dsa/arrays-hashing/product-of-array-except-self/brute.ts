function productExceptSelf(nums: number[]): number[] {
  return nums.map((_, i) => {
    let p = 1
    for (let j = 0; j < nums.length; j++) if (j !== i) p *= nums[j]
    return p
  })
}
