// Try every burst order, memoised on the set of balloons still standing (small n only).
function maxCoins(nums: number[]): number {
  const n = nums.length
  const memo = new Map<number, number>()
  const go = (alive: number): number => {
    if (alive === 0) return 0
    if (memo.has(alive)) return memo.get(alive)!
    let best = 0
    for (let i = 0; i < n; i++) {
      if (!(alive & (1 << i))) continue
      let left = 1
      for (let j = i - 1; j >= 0; j--) if (alive & (1 << j)) { left = nums[j]; break }
      let right = 1
      for (let j = i + 1; j < n; j++) if (alive & (1 << j)) { right = nums[j]; break }
      best = Math.max(best, left * nums[i] * right + go(alive & ~(1 << i)))
    }
    memo.set(alive, best)
    return best
  }
  return go((1 << n) - 1)
}
