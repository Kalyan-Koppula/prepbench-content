// Copy the matrix, then place each value directly: (r, c) moves to (c, n - 1 - r).
function rotate(matrix: number[][]): void {
  const n = matrix.length
  const copy: number[][] = []
  for (let r = 0; r < n; r++) {
    const row: number[] = []
    for (let c = 0; c < n; c++) {
      row.push(matrix[r][c])
    }
    copy.push(row)
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      matrix[c][n - 1 - r] = copy[r][c]
    }
  }
}
