// best[i] = most profit from days i.. when we may buy on day i.
// Either do nothing on day i, or buy on day i, sell on some day j > i and
// continue from day j + 2 (day j + 1 is the cooldown). O(n^2).
function maxProfit(prices: number[]): number {
  const n = prices.length
  const best = new Array(n + 2).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    best[i] = best[i + 1]
    for (let j = i + 1; j < n; j++) {
      const trade = prices[j] - prices[i] + best[j + 2]
      if (trade > best[i]) {
        best[i] = trade
      }
    }
  }
  return best[0]
}
