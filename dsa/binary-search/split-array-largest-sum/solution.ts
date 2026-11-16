function splitArray(nums: number[], k: number): number {
  const piecesNeeded = (limit: number) => {
    let pieces = 1
    let sum = 0
    for (const x of nums) {
      if (sum + x > limit) {
        pieces++
        sum = 0
      }
      sum += x
    }
    return pieces
  }
  let lo = Math.max(...nums)
  let hi = nums.reduce((a, b) => a + b, 0)
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (piecesNeeded(mid) <= k) hi = mid
    else lo = mid + 1
  }
  return lo
}
