function minimumEffortPath(heights: number[][]): number {
  const rows = heights.length
  const cols = heights[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  // best[r][c] = smallest effort found so far to reach (r, c).
  const best: number[][] = []
  for (let r = 0; r < rows; r++) {
    best.push(new Array(cols).fill(Infinity))
  }
  best[0][0] = 0
  // Dijkstra where a route's cost is its largest single step.
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [effort, r, c]
  heap.push([0, 0, 0])
  while (!heap.isEmpty()) {
    const top = heap.pop() as number[]
    const effort = top[0]
    const r = top[1]
    const c = top[2]
    if (effort > best[r][c]) {
      continue // stale entry
    }
    if (r === rows - 1 && c === cols - 1) {
      return effort // first time the target is popped, its effort is final
    }
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d]
      const nc = c + dc[d]
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) {
        continue
      }
      const step = Math.abs(heights[nr][nc] - heights[r][c])
      const candidate = step > effort ? step : effort
      if (candidate < best[nr][nc]) {
        best[nr][nc] = candidate
        heap.push([candidate, nr, nc])
      }
    }
  }
  return 0
}
