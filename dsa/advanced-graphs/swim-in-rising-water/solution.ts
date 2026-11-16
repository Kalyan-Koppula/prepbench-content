function swimInWater(grid: number[][]): number {
  const n = grid.length
  const seen = grid.map((row) => row.map(() => false))
  const pq = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [time, r, c]
  pq.push([grid[0][0], 0, 0])
  seen[0][0] = true
  while (!pq.isEmpty()) {
    const [time, r, c] = pq.pop()!
    if (r === n - 1 && c === n - 1) return time
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) continue
      seen[nr][nc] = true
      pq.push([Math.max(time, grid[nr][nc]), nr, nc])
    }
  }
  return -1
}
