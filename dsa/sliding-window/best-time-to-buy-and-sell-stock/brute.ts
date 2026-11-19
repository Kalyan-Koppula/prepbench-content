function maxProfit(prices: number[]): number {
  let best = 0
  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) {
      const profit = prices[sell] - prices[buy]
      if (profit > best) {
        best = profit
      }
    }
  }
  return best
}
