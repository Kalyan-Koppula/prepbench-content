// Dijkstra over cells (O(V^2) selection, no heap) — an independent shortest-path check.
function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  const dist = new Array(m * n).fill(Infinity)
  const done = new Array(m * n).fill(false)
  dist[0] = grid[0][0]
  for (let step = 0; step < m * n; step++) {
    let u = -1
    for (let v = 0; v < m * n; v++) if (!done[v] && (u === -1 || dist[v] < dist[u])) u = v
    done[u] = true
    const r = Math.floor(u / n)
    const c = u % n
    if (r + 1 < m) dist[u + n] = Math.min(dist[u + n], dist[u] + grid[r + 1][c])
    if (c + 1 < n) dist[u + 1] = Math.min(dist[u + 1], dist[u] + grid[r][c + 1])
  }
  return dist[m * n - 1]
}
