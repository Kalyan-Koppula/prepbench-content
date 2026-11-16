function rotate(matrix: number[][]): void {
  const n = matrix.length
  const copy = matrix.map((row) => [...row])
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) matrix[c][n - 1 - r] = copy[r][c]
}
