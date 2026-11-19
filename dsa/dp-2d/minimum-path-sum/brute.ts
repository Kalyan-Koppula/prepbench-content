// Top-down recursion with memoisation: cheapest path from (i, j) to the bottom-right.
function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  const memo: number[][] = []
  for (let i = 0; i < m; i++) {
    memo.push(new Array(n).fill(-1))
  }
  return cheapestFrom(grid, 0, 0, memo)
}

function cheapestFrom(grid: number[][], i: number, j: number, memo: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  if (i === m - 1 && j === n - 1) {
    return grid[i][j]
  }
  if (memo[i][j] !== -1) {
    return memo[i][j]
  }
  let best = Infinity
  if (i + 1 < m) {
    best = Math.min(best, cheapestFrom(grid, i + 1, j, memo))
  }
  if (j + 1 < n) {
    best = Math.min(best, cheapestFrom(grid, i, j + 1, memo))
  }
  memo[i][j] = grid[i][j] + best
  return memo[i][j]
}
