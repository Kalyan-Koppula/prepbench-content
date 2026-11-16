function coinChange(coins: number[], amount: number): number {
  // fewest[x] = minimum coins summing to x (Infinity if impossible).
  const fewest = new Array(amount + 1).fill(Infinity)
  fewest[0] = 0
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x && fewest[x - c] + 1 < fewest[x]) fewest[x] = fewest[x - c] + 1
    }
  }
  return fewest[amount] === Infinity ? -1 : fewest[amount]
}
