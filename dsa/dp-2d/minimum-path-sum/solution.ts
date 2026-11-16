function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  // best[j] = cheapest cost to reach column j of the current row.
  const best = new Array(n).fill(0)
  best[0] = grid[0][0]
  for (let j = 1; j < n; j++) best[j] = best[j - 1] + grid[0][j]
  for (let i = 1; i < m; i++) {
    best[0] += grid[i][0]
    for (let j = 1; j < n; j++) {
      best[j] = grid[i][j] + Math.min(best[j], best[j - 1]) // above vs left
    }
  }
  return best[n - 1]
}
