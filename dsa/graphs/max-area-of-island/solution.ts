function maxAreaOfIsland(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  let best = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 1) continue
      grid[r][c] = 0
      const stack: number[][] = [[r, c]]
      let area = 0
      while (stack.length) {
        const [cr, cc] = stack.pop()!
        area++
        for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] !== 1) continue
          grid[nr][nc] = 0
          stack.push([nr, nc])
        }
      }
      best = Math.max(best, area)
    }
  }
  return best
}
