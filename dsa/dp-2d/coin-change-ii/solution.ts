function change(amount: number, coins: number[]): number {
  // ways[x] = combinations summing to x using the coins processed so far.
  const ways = new Array(amount + 1).fill(0)
  ways[0] = 1
  for (const c of coins) {
    // Upward: ways[x - c] already includes coin c, so c can be reused.
    for (let x = c; x <= amount; x++) ways[x] += ways[x - c]
  }
  return ways[amount]
}
