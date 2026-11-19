function wallsAndGates(rooms: number[][]): void {
  const INF = 2147483647
  const rows = rooms.length
  const cols = rooms[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  // Multi-source BFS from every gate at once.
  const queue: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rooms[r][c] === 0) {
        queue.push(r * cols + c)
      }
    }
  }
  let head = 0
  while (head < queue.length) {
    const cell = queue[head]
    head++
    const r = Math.floor(cell / cols)
    const c = cell % cols
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d]
      const nc = c + dc[d]
      // Only unvisited empty rooms; walls (-1) and gates/visited rooms are skipped.
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || rooms[nr][nc] !== INF) {
        continue
      }
      rooms[nr][nc] = rooms[r][c] + 1
      queue.push(nr * cols + nc)
    }
  }
}
