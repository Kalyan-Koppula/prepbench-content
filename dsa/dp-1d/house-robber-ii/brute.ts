// Split on whether house 0 is taken, then O(n^2) "last taken house" DP on the remaining row.
function rob(nums: number[]): number {
  const line = (arr: number[]) => {
    const endAt: number[] = []
    let best = 0
    for (let i = 0; i < arr.length; i++) {
      let before = 0
      for (let j = 0; j <= i - 2; j++) before = Math.max(before, endAt[j])
      endAt.push(before + arr[i])
      best = Math.max(best, endAt[i])
    }
    return best
  }
  const n = nums.length
  if (n === 1) return nums[0]
  const skipFirst = line(nums.slice(1))
  const takeFirst = nums[0] + line(nums.slice(2, n - 1)) // neighbours 1 and n-1 are off-limits
  return Math.max(skipFirst, takeFirst)
}
