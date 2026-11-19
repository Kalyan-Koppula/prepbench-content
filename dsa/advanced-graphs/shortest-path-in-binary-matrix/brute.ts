function shortestPathBinaryMatrix(grid: number[][]): number {
  // Relax every open cell from its 8 neighbours until nothing improves
  // (Bellman-Ford on the grid): O((n^2)^2) in the worst case.
  const n = grid.length
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) {
    return -1
  }
  const dist: number[][] = []
  for (let r = 0; r < n; r++) {
    dist.push(new Array(n).fill(Infinity))
  }
  dist[0][0] = 1
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] === 1) {
          continue
        }
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr < 0 || nc < 0 || nr >= n || nc >= n) {
              continue
            }
            if (dist[nr][nc] + 1 < dist[r][c]) {
              dist[r][c] = dist[nr][nc] + 1
              changed = true
            }
          }
        }
      }
    }
  }
  return dist[n - 1][n - 1] === Infinity ? -1 : dist[n - 1][n - 1]
}
