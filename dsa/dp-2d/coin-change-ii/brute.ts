// Decide how many copies of each coin to use, coin by coin, with memoisation.
function change(amount: number, coins: number[]): number {
  const memo: number[][] = []
  for (let i = 0; i < coins.length; i++) {
    memo.push(new Array(amount + 1).fill(-1))
  }
  return countWays(coins, 0, amount, memo)
}

function countWays(coins: number[], i: number, rest: number, memo: number[][]): number {
  if (i === coins.length) {
    return rest === 0 ? 1 : 0
  }
  if (memo[i][rest] !== -1) {
    return memo[i][rest]
  }
  let total = 0
  for (let used = 0; used * coins[i] <= rest; used++) {
    total += countWays(coins, i + 1, rest - used * coins[i], memo)
  }
  memo[i][rest] = total
  return total
}
