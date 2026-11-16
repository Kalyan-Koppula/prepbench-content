function numIslands(grid: string[][]): number {
  const m = grid.length
  const n = grid[0].length
  const parent = Array.from({ length: m * n }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) x = parent[x] = parent[parent[x]]
    return x
  }
  let land = 0
  let unions = 0
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== '1') continue
      land++
      for (const [nr, nc] of [[r + 1, c], [r, c + 1]]) {
        if (nr >= m || nc >= n || grid[nr][nc] !== '1') continue
        const a = find(r * n + c)
        const b = find(nr * n + nc)
        if (a !== b) {
          parent[a] = b
          unions++
        }
      }
    }
  return land - unions
}
