function wallsAndGates(rooms: number[][]): void {
  // One separate BFS per gate, keeping the smallest distance per room:
  // O(gates * m * n).
  const INF = 2147483647
  const rows = rooms.length
  const cols = rooms[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const best: number[][] = []
  for (let r = 0; r < rows; r++) {
    best.push(rooms[r].slice())
  }
  for (let gr = 0; gr < rows; gr++) {
    for (let gc = 0; gc < cols; gc++) {
      if (rooms[gr][gc] !== 0) {
        continue
      }
      const dist: number[][] = []
      for (let r = 0; r < rows; r++) {
        dist.push(new Array(cols).fill(-1))
      }
      dist[gr][gc] = 0
      const queue: number[] = [gr * cols + gc]
      let head = 0
      while (head < queue.length) {
        const cell = queue[head]
        head++
        const r = Math.floor(cell / cols)
        const c = cell % cols
        for (let d = 0; d < 4; d++) {
          const nr = r + dr[d]
          const nc = c + dc[d]
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || rooms[nr][nc] === -1 || dist[nr][nc] !== -1) {
            continue
          }
          dist[nr][nc] = dist[r][c] + 1
          if (rooms[nr][nc] === INF && dist[nr][nc] < best[nr][nc]) {
            best[nr][nc] = dist[nr][nc]
          }
          queue.push(nr * cols + nc)
        }
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rooms[r][c] = best[r][c]
    }
  }
}
