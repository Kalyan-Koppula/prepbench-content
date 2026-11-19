function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length
  // best[i][w] = most value from the first i items with total weight at most w.
  const best: number[][] = []
  for (let i = 0; i <= n; i++) {
    best.push(new Array(capacity + 1).fill(0))
  }
  for (let i = 1; i <= n; i++) {
    const weight = weights[i - 1]
    const value = values[i - 1]
    for (let w = 0; w <= capacity; w++) {
      best[i][w] = best[i - 1][w] // skip item i - 1
      if (weight <= w && best[i - 1][w - weight] + value > best[i][w]) {
        best[i][w] = best[i - 1][w - weight] + value // take it (previous row: once only)
      }
    }
  }
  return best[n][capacity]
}
