function change(amount: number, coins: number[]): number {
  const n = coins.length
  // ways[i][x] = number of combinations that make x using only the first i coin types.
  const ways: number[][] = []
  for (let i = 0; i <= n; i++) {
    ways.push(new Array(amount + 1).fill(0))
  }
  for (let i = 0; i <= n; i++) {
    ways[i][0] = 1 // the empty combination makes 0
  }
  for (let i = 1; i <= n; i++) {
    const coin = coins[i - 1]
    for (let x = 1; x <= amount; x++) {
      ways[i][x] = ways[i - 1][x] // use no more of this coin
      if (x >= coin) {
        ways[i][x] += ways[i][x - coin] // use one more of it (same row: it can repeat)
      }
    }
  }
  return ways[n][amount]
}
