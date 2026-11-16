function updateMatrix(mat: number[][]): number[][] {
  const m = mat.length
  const n = mat[0].length
  const dist = mat.map((row) => row.map(() => -1))
  const queue: number[][] = []
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (mat[r][c] === 0) {
        dist[r][c] = 0
        queue.push([r, c])
      }

  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head]
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= m || nc >= n || dist[nr][nc] !== -1) continue
      dist[nr][nc] = dist[r][c] + 1
      queue.push([nr, nc])
    }
  }
  return dist
}
