function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  // cost[i][j] = cheapest sum of a path from (0, 0) to (i, j), moving right or down.
  const cost: number[][] = []
  for (let i = 0; i < m; i++) {
    cost.push(new Array(n).fill(0))
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) {
        cost[i][j] = grid[0][0]
      } else if (i === 0) {
        cost[i][j] = cost[i][j - 1] + grid[i][j] // first row: only from the left
      } else if (j === 0) {
        cost[i][j] = cost[i - 1][j] + grid[i][j] // first column: only from above
      } else {
        cost[i][j] = grid[i][j] + Math.min(cost[i - 1][j], cost[i][j - 1])
      }
    }
  }
  return cost[m - 1][n - 1]
}
