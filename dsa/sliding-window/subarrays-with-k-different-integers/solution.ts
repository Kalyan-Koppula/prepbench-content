function subarraysWithKDistinct(nums: number[], k: number): number {
  // Number of subarrays with at most `limit` distinct values.
  const atMost = (limit: number): number => {
    const count = new Map<number, number>()
    let left = 0
    let total = 0
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) ?? 0) + 1)
      while (count.size > limit) {
        const v = nums[left++]
        const c = count.get(v)! - 1
        if (c === 0) count.delete(v)
        else count.set(v, c)
      }
      // Every start in [left, right] works for this end.
      total += right - left + 1
    }
    return total
  }
  return atMost(k) - atMost(k - 1)
}
