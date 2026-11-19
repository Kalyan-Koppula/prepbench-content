function areaFrom(grid: number[][], seen: boolean[][], r: number, c: number): number {
  if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) {
    return 0
  }
  if (grid[r][c] !== 1 || seen[r][c]) {
    return 0
  }
  seen[r][c] = true
  return 1 + areaFrom(grid, seen, r + 1, c) + areaFrom(grid, seen, r - 1, c) + areaFrom(grid, seen, r, c + 1) + areaFrom(grid, seen, r, c - 1)
}

function maxAreaOfIsland(grid: number[][]): number {
  // Recursive DFS with a separate visited grid (leaves the input unchanged).
  const seen: boolean[][] = []
  for (let r = 0; r < grid.length; r++) {
    seen.push(new Array(grid[0].length).fill(false))
  }
  let best = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const area = areaFrom(grid, seen, r, c)
      if (area > best) {
        best = area
      }
    }
  }
  return best
}
