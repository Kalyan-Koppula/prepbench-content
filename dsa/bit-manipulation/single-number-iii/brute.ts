// Count each value, then collect the ones seen once (in order of appearance).
function singleNumber(nums: number[]): number[] {
  const count = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    if (count.has(x)) {
      count.set(x, (count.get(x) as number) + 1)
    } else {
      count.set(x, 1)
    }
  }
  const result: number[] = []
  for (let i = 0; i < nums.length; i++) {
    if (count.get(nums[i]) === 1) {
      result.push(nums[i])
    }
  }
  return result
}
