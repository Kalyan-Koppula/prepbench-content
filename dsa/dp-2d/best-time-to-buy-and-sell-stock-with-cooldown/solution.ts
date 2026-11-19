function maxProfit(prices: number[]): number {
  // The best profit at the end of the current day, for each of three states.
  let holding = -prices[0] // we own a share
  let justSold = -Infinity // we sold today, so tomorrow we must rest
  let resting = 0 // we own nothing and may buy tomorrow
  for (let i = 1; i < prices.length; i++) {
    const oldHolding = holding
    const oldJustSold = justSold
    const oldResting = resting
    holding = Math.max(oldHolding, oldResting - prices[i]) // keep it, or buy today
    justSold = oldHolding + prices[i] // sell today
    resting = Math.max(oldResting, oldJustSold) // stay idle, or finish the cooldown
  }
  return Math.max(resting, justSold)
}
