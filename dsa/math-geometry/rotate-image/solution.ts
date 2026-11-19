function rotate(matrix: number[][]): void {
  const n = matrix.length
  // 1. Transpose: swap across the main diagonal, so (r, c) goes to (c, r).
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const temp = matrix[i][j]
      matrix[i][j] = matrix[j][i]
      matrix[j][i] = temp
    }
  }
  // 2. Reverse each row, so (c, r) goes to (c, n - 1 - r).
  for (let i = 0; i < n; i++) {
    let left = 0
    let right = n - 1
    while (left < right) {
      const temp = matrix[i][left]
      matrix[i][left] = matrix[i][right]
      matrix[i][right] = temp
      left++
      right--
    }
  }
}
