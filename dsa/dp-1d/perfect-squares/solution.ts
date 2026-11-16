function numSquares(n: number): number {
  // fewest[x] = minimum number of squares summing to x.
  const fewest = new Array(n + 1).fill(Infinity)
  fewest[0] = 0
  for (let x = 1; x <= n; x++) {
    for (let k = 1; k * k <= x; k++) {
      fewest[x] = Math.min(fewest[x], fewest[x - k * k] + 1)
    }
  }
  return fewest[n]
}
