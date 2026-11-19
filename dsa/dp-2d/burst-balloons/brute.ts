// The same interval recurrence, written top-down with memoisation.
function maxCoins(nums: number[]): number {
  const val: number[] = [1]
  for (let i = 0; i < nums.length; i++) {
    val.push(nums[i])
  }
  val.push(1)
  const memo: number[][] = []
  for (let i = 0; i < val.length; i++) {
    memo.push(new Array(val.length).fill(-1))
  }
  return bestBetween(val, 0, val.length - 1, memo)
}

function bestBetween(val: number[], l: number, r: number, memo: number[][]): number {
  if (r - l < 2) {
    return 0 // nothing strictly between l and r
  }
  if (memo[l][r] !== -1) {
    return memo[l][r]
  }
  let best = 0
  for (let k = l + 1; k < r; k++) {
    const coins = bestBetween(val, l, k, memo) + val[l] * val[k] * val[r] + bestBetween(val, k, r, memo)
    if (coins > best) {
      best = coins
    }
  }
  memo[l][r] = best
  return best
}
