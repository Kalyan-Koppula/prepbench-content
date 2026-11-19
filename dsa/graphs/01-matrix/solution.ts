function updateMatrix(mat: number[][]): number[][] {
  const rows = mat.length
  const cols = mat[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const dist: number[][] = []
  const queue: number[] = []
  // Multi-source BFS from every 0 at once.
  for (let r = 0; r < rows; r++) {
    dist.push(new Array(cols).fill(-1)) // -1 = not reached yet
    for (let c = 0; c < cols; c++) {
      if (mat[r][c] === 0) {
        dist[r][c] = 0
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
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || dist[nr][nc] !== -1) {
        continue
      }
      dist[nr][nc] = dist[r][c] + 1 // first reached = nearest zero
      queue.push(nr * cols + nc)
    }
  }
  return dist
}
