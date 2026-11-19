function minimumEffortPath(heights: number[][]): number {
  // Binary search on the effort limit; check each limit with BFS.
  const rows = heights.length
  const cols = heights[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]

  function reachable(limit: number): boolean {
    const seen: boolean[][] = []
    for (let r = 0; r < rows; r++) {
      seen.push(new Array(cols).fill(false))
    }
    seen[0][0] = true
    const queue: number[] = [0]
    let head = 0
    while (head < queue.length) {
      const cell = queue[head]
      head++
      const r = Math.floor(cell / cols)
      const c = cell % cols
      if (r === rows - 1 && c === cols - 1) {
        return true
      }
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) {
          continue
        }
        if (Math.abs(heights[nr][nc] - heights[r][c]) > limit) {
          continue
        }
        seen[nr][nc] = true
        queue.push(nr * cols + nc)
      }
    }
    return false
  }

  let lo = 0
  let hi = 1000000
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (reachable(mid)) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}
