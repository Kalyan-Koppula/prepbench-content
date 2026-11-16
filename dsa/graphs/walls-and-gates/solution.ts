function wallsAndGates(rooms: number[][]): void {
  const INF = 2147483647
  const m = rooms.length
  const n = rooms[0].length
  const queue: number[][] = []
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) if (rooms[r][c] === 0) queue.push([r, c])

  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= m || nc >= n || rooms[nr][nc] !== INF) continue
      rooms[nr][nc] = rooms[r][c] + 1
      queue.push([nr, nc])
    }
  }
}
