function orangesRotting(grid: number[][]): number {
  // Simulate minute by minute, rescanning the whole grid each minute.
  const rows = grid.length
  const cols = grid[0].length
  let minutes = 0
  while (true) {
    const toRotRows: number[] = []
    const toRotCols: number[] = []
    let fresh = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== 1) {
          continue
        }
        fresh++
        const nearRotten =
          (r > 0 && grid[r - 1][c] === 2) ||
          (r < rows - 1 && grid[r + 1][c] === 2) ||
          (c > 0 && grid[r][c - 1] === 2) ||
          (c < cols - 1 && grid[r][c + 1] === 2)
        if (nearRotten) {
          toRotRows.push(r)
          toRotCols.push(c)
        }
      }
    }
    if (fresh === 0) {
      return minutes
    }
    if (toRotRows.length === 0) {
      return -1 // fresh oranges remain but none can rot
    }
    for (let i = 0; i < toRotRows.length; i++) {
      grid[toRotRows[i]][toRotCols[i]] = 2
    }
    minutes++
  }
}
