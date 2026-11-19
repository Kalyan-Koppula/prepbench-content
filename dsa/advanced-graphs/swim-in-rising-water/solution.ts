function swimInWater(grid: number[][]): number {
  const n = grid.length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const seen: boolean[][] = []
  for (let r = 0; r < n; r++) {
    seen.push(new Array(n).fill(false))
  }
  // Dijkstra where a path costs the highest elevation on it.
  const heap = new PriorityQueue<number[]>((a, b) => a[0] - b[0]) // [time, r, c]
  heap.push([grid[0][0], 0, 0])
  seen[0][0] = true
  while (!heap.isEmpty()) {
    const top = heap.pop() as number[]
    const time = top[0]
    const r = top[1]
    const c = top[2]
    if (r === n - 1 && c === n - 1) {
      return time
    }
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d]
      const nc = c + dc[d]
      if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc]) {
        continue
      }
      seen[nr][nc] = true
      // Reaching the neighbour needs the water at least as high as both cells.
      heap.push([time > grid[nr][nc] ? time : grid[nr][nc], nr, nc])
    }
  }
  return -1
}
