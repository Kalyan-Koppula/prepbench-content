function wallsAndGates(rooms: number[][]): void {
  const INF = 2147483647
  const m = rooms.length
  const n = rooms[0].length
  const best = rooms.map((row) => row.slice())
  // One independent BFS per gate; keep the minimum distance seen.
  for (let gr = 0; gr < m; gr++)
    for (let gc = 0; gc < n; gc++) {
      if (rooms[gr][gc] !== 0) continue
      const dist = rooms.map((row) => row.map(() => -1))
      dist[gr][gc] = 0
      const queue = [[gr, gc]]
      for (let h = 0; h < queue.length; h++) {
        const [r, c] = queue[h]
        for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || rooms[nr][nc] === -1 || dist[nr][nc] !== -1) continue
          dist[nr][nc] = dist[r][c] + 1
          queue.push([nr, nc])
          if (rooms[nr][nc] === INF) best[nr][nc] = Math.min(best[nr][nc], dist[nr][nc])
        }
      }
    }
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) rooms[r][c] = best[r][c]
}
