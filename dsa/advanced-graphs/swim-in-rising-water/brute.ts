function swimInWater(grid: number[][]): number {
  // Binary search on the time t; check each t with BFS over cells <= t.
  const n = grid.length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]

  function canReach(t: number): boolean {
    if (grid[0][0] > t) {
      return false
    }
    const seen: boolean[][] = []
    for (let r = 0; r < n; r++) {
      seen.push(new Array(n).fill(false))
    }
    seen[0][0] = true
    const queue: number[] = [0]
    let head = 0
    while (head < queue.length) {
      const r = Math.floor(queue[head] / n)
      const c = queue[head] % n
      head++
      if (r === n - 1 && c === n - 1) {
        return true
      }
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr < 0 || nc < 0 || nr >= n || nc >= n || seen[nr][nc] || grid[nr][nc] > t) {
          continue
        }
        seen[nr][nc] = true
        queue.push(nr * n + nc)
      }
    }
    return false
  }

  let lo = 0
  let hi = n * n - 1
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (canReach(mid)) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return lo
}
