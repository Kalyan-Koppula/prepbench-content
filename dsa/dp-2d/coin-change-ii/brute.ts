// Decide how many of each coin to use, coin by coin (memoised so the larger tests finish).
function change(amount: number, coins: number[]): number {
  const memo = new Map<string, number>()
  const count = (i: number, rest: number): number => {
    if (i === coins.length) return rest === 0 ? 1 : 0
    const key = i + ',' + rest
    if (memo.has(key)) return memo.get(key)!
    let total = 0
    for (let used = 0; used * coins[i] <= rest; used++) total += count(i + 1, rest - used * coins[i])
    memo.set(key, total)
    return total
  }
  return count(0, amount)
}
