function knapsack(weights: number[], values: number[], capacity: number): number {
  // best[w] = most value achievable with total weight <= w, using items seen so far.
  const best = new Array(capacity + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    // Downward, so best[w - weight] still excludes item i.
    for (let w = capacity; w >= weights[i]; w--) {
      best[w] = Math.max(best[w], best[w - weights[i]] + values[i])
    }
  }
  return best[capacity]
}
