function shortestPathBinaryMatrix(grid: number[][]): number {
  const n = grid.length
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1
  grid[0][0] = 1 // visited
  let frontier = [[0, 0]]
  let length = 1
  while (frontier.length) {
    const next: number[][] = []
    for (const [r, c] of frontier) {
      if (r === n - 1 && c === n - 1) return length
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] !== 0) continue
          grid[nr][nc] = 1
          next.push([nr, nc])
        }
    }
    frontier = next
    length++
  }
  return -1
}
