function maxProfit(prices: number[]): number {
  // Best profit at the end of the current day in each state.
  let hold = -prices[0] // own a share
  let sold = -Infinity // sold today (must rest tomorrow)
  let free = 0 // no share, allowed to buy tomorrow
  for (let i = 1; i < prices.length; i++) {
    const prevHold = hold
    hold = Math.max(hold, free - prices[i]) // keep holding, or buy (only from free)
    free = Math.max(free, sold) // rest; yesterday's sale finishes its cooldown
    sold = prevHold + prices[i] // sell today
  }
  return Math.max(free, sold)
}
