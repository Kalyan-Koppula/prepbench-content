function coinChange(coins: number[], amount: number): number {
  // fewest[x] = minimum number of coins that add up to x (Infinity if impossible).
  const fewest = new Array(amount + 1).fill(Infinity)
  fewest[0] = 0
  for (let x = 1; x <= amount; x++) {
    // Try each coin as the last one used.
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i]
      if (c <= x && fewest[x - c] + 1 < fewest[x]) {
        fewest[x] = fewest[x - c] + 1
      }
    }
  }
  return fewest[amount] === Infinity ? -1 : fewest[amount]
}
