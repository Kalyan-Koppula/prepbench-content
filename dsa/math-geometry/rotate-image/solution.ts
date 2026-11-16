function rotate(matrix: number[][]): void {
  const n = matrix.length
  // Transpose: swap across the main diagonal.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const tmp = matrix[i][j]
      matrix[i][j] = matrix[j][i]
      matrix[j][i] = tmp
    }
  }
  // Mirror left-right.
  for (const row of matrix) row.reverse()
}
