function orangesRotting(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  // Multi-source BFS: every rotten orange starts in the first wave.
  let wave: number[] = []
  let fresh = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) {
        wave.push(r * cols + c)
      } else if (grid[r][c] === 1) {
        fresh++
      }
    }
  }
  let minutes = 0
  while (wave.length > 0 && fresh > 0) {
    const next: number[] = []
    for (let i = 0; i < wave.length; i++) {
      const r = Math.floor(wave[i] / cols)
      const c = wave[i] % cols
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== 1) {
          continue
        }
        grid[nr][nc] = 2
        fresh--
        next.push(nr * cols + nc)
      }
    }
    wave = next
    minutes++ // one wave = one minute
  }
  return fresh === 0 ? minutes : -1
}
