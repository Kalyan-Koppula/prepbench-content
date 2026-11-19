function maxProfit(prices: number[]): number {
  let minPrice = prices[0] // cheapest buy day seen so far
  let best = 0
  for (let day = 1; day < prices.length; day++) {
    // Selling today, the best buy is the cheapest earlier day.
    const profit = prices[day] - minPrice
    if (profit > best) {
      best = profit
    }
    if (prices[day] < minPrice) {
      minPrice = prices[day]
    }
  }
  return best
}
