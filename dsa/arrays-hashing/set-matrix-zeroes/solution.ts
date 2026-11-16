function setZeroes(matrix: number[][]): void {
  const m = matrix.length
  const n = matrix[0].length
  const firstRowZero = matrix[0].some((v) => v === 0)
  const firstColZero = matrix.some((row) => row[0] === 0)

  // Use row 0 and column 0 as markers for the rest of the grid.
  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      if (matrix[r][c] === 0) {
        matrix[r][0] = 0
        matrix[0][c] = 0
      }

  for (let r = 1; r < m; r++)
    for (let c = 1; c < n; c++)
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0

  if (firstRowZero) for (let c = 0; c < n; c++) matrix[0][c] = 0
  if (firstColZero) for (let r = 0; r < m; r++) matrix[r][0] = 0
}
