// Simulate walking: go straight until the next cell is outside or already visited,
// then turn right.
function spiralOrder(matrix: number[][]): number[] {
  const m = matrix.length
  const n = matrix[0].length
  const visited: boolean[][] = []
  for (let r = 0; r < m; r++) {
    visited.push(new Array(n).fill(false))
  }
  const dr = [0, 1, 0, -1] // right, down, left, up
  const dc = [1, 0, -1, 0]
  const result: number[] = []
  let r = 0
  let c = 0
  let d = 0
  for (let k = 0; k < m * n; k++) {
    result.push(matrix[r][c])
    visited[r][c] = true
    const nr = r + dr[d]
    const nc = c + dc[d]
    if (nr < 0 || nr >= m || nc < 0 || nc >= n || visited[nr][nc]) {
      d = (d + 1) % 4
    }
    r += dr[d]
    c += dc[d]
  }
  return result
}
