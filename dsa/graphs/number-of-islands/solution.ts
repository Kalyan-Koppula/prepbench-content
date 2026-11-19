function numIslands(grid: string[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  let islands = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') {
        continue
      }
      islands++ // a new island: sink all of it so it isn't counted again
      grid[r][c] = '0'
      const stack: number[] = [r * cols + c]
      while (stack.length > 0) {
        const cell = stack.pop() as number
        const cr = Math.floor(cell / cols)
        const cc = cell % cols
        for (let d = 0; d < 4; d++) {
          const nr = cr + dr[d]
          const nc = cc + dc[d]
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== '1') {
            continue
          }
          grid[nr][nc] = '0'
          stack.push(nr * cols + nc)
        }
      }
    }
  }
  return islands
}
