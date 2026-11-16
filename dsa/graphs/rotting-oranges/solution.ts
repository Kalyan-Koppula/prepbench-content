function orangesRotting(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  let queue: number[][] = []
  let fresh = 0
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 2) queue.push([r, c])
      else if (grid[r][c] === 1) fresh++
    }

  let minutes = 0
  while (queue.length && fresh > 0) {
    const next: number[][] = []
    for (const [r, c] of queue) {
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] !== 1) continue
        grid[nr][nc] = 2
        fresh--
        next.push([nr, nc])
      }
    }
    queue = next
    minutes++
  }
  return fresh === 0 ? minutes : -1
}
