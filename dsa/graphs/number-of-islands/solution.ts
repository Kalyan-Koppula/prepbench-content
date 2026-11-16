function numIslands(grid: string[][]): number {
  const m = grid.length
  const n = grid[0].length
  let islands = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1') continue
      islands++
      // Sink the whole island so its other cells aren't counted again.
      grid[r][c] = '0'
      const stack: number[][] = [[r, c]]
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] !== '1') continue
          grid[nr][nc] = '0'
          stack.push([nr, nc])
        }
      }
    }
  }
  return islands
}
