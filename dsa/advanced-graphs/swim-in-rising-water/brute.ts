function swimInWater(grid: number[][]): number {
  const n = grid.length
  // Try each water level in turn and flood-fill from the start.
  for (let t = Math.max(grid[0][0], grid[n - 1][n - 1]); ; t++) {
    const seen = grid.map((row) => row.map(() => false))
    seen[0][0] = true
    const queue = [[0, 0]]
    for (let h = 0; h < queue.length; h++) {
      const [r, c] = queue[h]
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc] || grid[nr][nc] > t) continue
        seen[nr][nc] = true
        queue.push([nr, nc])
      }
    }
    if (seen[n - 1][n - 1]) return t
  }
}
