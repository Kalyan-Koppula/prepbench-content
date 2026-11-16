// O(n^2): best[i] = max profit using days i.. when allowed to buy on day i.
// Either skip day i, or buy on i, sell on some j > i, and resume at j + 2.
function maxProfit(prices: number[]): number {
  const n = prices.length
  const best = new Array(n + 2).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    best[i] = best[i + 1]
    for (let j = i + 1; j < n; j++) best[i] = Math.max(best[i], prices[j] - prices[i] + best[j + 2])
  }
  return best[0]
}
