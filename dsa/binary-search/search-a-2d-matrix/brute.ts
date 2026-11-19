function searchMatrix(matrix: number[][], target: number): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === target) {
        return true
      }
    }
  }
  return false
}
