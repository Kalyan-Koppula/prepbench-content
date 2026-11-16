function maxAreaOfIsland(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  // Label propagation: every land cell starts with its own id; repeatedly take the min id of land neighbours.
  const label = grid.map((row, r) => row.map((v, c) => (v === 1 ? r * n + c : -1)))
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) {
        if (label[r][c] < 0) continue
        for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || label[nr][nc] < 0) continue
          if (label[nr][nc] < label[r][c]) {
            label[r][c] = label[nr][nc]
            changed = true
          }
        }
      }
  }
  const count = new Map<number, number>()
  let best = 0
  for (const row of label)
    for (const id of row) {
      if (id < 0) continue
      const k = (count.get(id) ?? 0) + 1
      count.set(id, k)
      best = Math.max(best, k)
    }
  return best
}
