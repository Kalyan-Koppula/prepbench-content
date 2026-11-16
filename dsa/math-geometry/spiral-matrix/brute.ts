function spiralOrder(matrix: number[][]): number[] {
  const m = matrix.length
  const n = matrix[0].length
  const seen = matrix.map((row) => row.map(() => false))
  const dr = [0, 1, 0, -1]
  const dc = [1, 0, -1, 0]
  const out: number[] = []
  let r = 0
  let c = 0
  let d = 0
  for (let k = 0; k < m * n; k++) {
    out.push(matrix[r][c])
    seen[r][c] = true
    const nr = r + dr[d]
    const nc = c + dc[d]
    if (nr < 0 || nr >= m || nc < 0 || nc >= n || seen[nr][nc]) d = (d + 1) % 4
    r += dr[d]
    c += dc[d]
  }
  return out
}
