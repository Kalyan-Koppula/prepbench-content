function minimumEffortPath(heights: number[][]): number {
  const m = heights.length
  const n = heights[0].length
  const best = heights.map((row) => row.map(() => Infinity))
  best[0][0] = 0
  const pq = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [effort, r, c]
  pq.push([0, 0, 0])
  while (!pq.isEmpty()) {
    const [effort, r, c] = pq.pop()!
    if (effort > best[r][c]) continue
    if (r === m - 1 && c === n - 1) return effort
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= m || nc >= n) continue
      // A route is only as easy as its hardest step.
      const cand = Math.max(effort, Math.abs(heights[nr][nc] - heights[r][c]))
      if (cand < best[nr][nc]) {
        best[nr][nc] = cand
        pq.push([cand, nr, nc])
      }
    }
  }
  return 0
}
