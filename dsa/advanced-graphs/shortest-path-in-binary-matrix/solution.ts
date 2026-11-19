function shortestPathBinaryMatrix(grid: number[][]): number {
  const n = grid.length
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) {
    return -1
  }
  // BFS: all moves cost 1, so the first time we reach the corner is the shortest.
  grid[0][0] = 1 // mark visited
  let level: number[] = [0] // cells as r * n + c
  let length = 1
  while (level.length > 0) {
    const next: number[] = []
    for (let i = 0; i < level.length; i++) {
      const r = Math.floor(level[i] / n)
      const c = level[i] % n
      if (r === n - 1 && c === n - 1) {
        return length
      }
      // All 8 neighbours.
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] !== 0) {
            continue
          }
          grid[nr][nc] = 1
          next.push(nr * n + nc)
        }
      }
    }
    level = next
    length++
  }
  return -1
}
