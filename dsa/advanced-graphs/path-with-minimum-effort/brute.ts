function minimumEffortPath(heights: number[][]): number {
  const m = heights.length
  const n = heights[0].length
  const reachable = (limit: number) => {
    const seen = heights.map((row) => row.map(() => false))
    seen[0][0] = true
    const queue = [[0, 0]]
    for (let h = 0; h < queue.length; h++) {
      const [r, c] = queue[h]
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc]) continue
        if (Math.abs(heights[nr][nc] - heights[r][c]) > limit) continue
        seen[nr][nc] = true
        queue.push([nr, nc])
      }
    }
    return seen[m - 1][n - 1]
  }
  let lo = 0
  let hi = 1000000
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (reachable(mid)) hi = mid
    else lo = mid + 1
  }
  return lo
}
