function maxAreaOfIsland(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  let best = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) {
        continue
      }
      // Flood the island, counting its cells and sinking them as we go.
      grid[r][c] = 0
      const stack: number[] = [r * cols + c]
      let area = 0
      while (stack.length > 0) {
        const cell = stack.pop() as number
        area++
        const cr = Math.floor(cell / cols)
        const cc = cell % cols
        for (let d = 0; d < 4; d++) {
          const nr = cr + dr[d]
          const nc = cc + dc[d]
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== 1) {
            continue
          }
          grid[nr][nc] = 0
          stack.push(nr * cols + nc)
        }
      }
      if (area > best) {
        best = area
      }
    }
  }
  return best
}
