// Count each value in a hash map and return the one seen once.
function singleNumber(nums: number[]): number {
  const count = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    if (count.has(x)) {
      count.set(x, (count.get(x) as number) + 1)
    } else {
      count.set(x, 1)
    }
  }
  for (let i = 0; i < nums.length; i++) {
    if (count.get(nums[i]) === 1) {
      return nums[i]
    }
  }
  return 0
}
