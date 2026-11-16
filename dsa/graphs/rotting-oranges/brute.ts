function orangesRotting(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  let minutes = 0
  for (;;) {
    const toRot: number[][] = []
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) {
        if (grid[r][c] !== 1) continue
        const near = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].some(
          ([nr, nc]) => nr >= 0 && nc >= 0 && nr < m && nc < n && grid[nr][nc] === 2,
        )
        if (near) toRot.push([r, c])
      }
    if (toRot.length === 0) break
    for (const [r, c] of toRot) grid[r][c] = 2
    minutes++
  }
  return grid.some((row) => row.includes(1)) ? -1 : minutes
}
