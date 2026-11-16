function shortestPathBinaryMatrix(grid: number[][]): number {
  // Relax every cell from its 8 neighbours until nothing improves.
  const n = grid.length
  if (grid[0][0] === 1) return -1
  const dist = grid.map((row) => row.map(() => Infinity))
  dist[0][0] = 1
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        if (grid[r][c] === 1) continue
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const pr = r + dr
            const pc = c + dc
            if (pr < 0 || pc < 0 || pr >= n || pc >= n) continue
            if (dist[pr][pc] + 1 < dist[r][c]) {
              dist[r][c] = dist[pr][pc] + 1
              changed = true
            }
          }
      }
  }
  const d = dist[n - 1][n - 1]
  return d === Infinity ? -1 : d
}
