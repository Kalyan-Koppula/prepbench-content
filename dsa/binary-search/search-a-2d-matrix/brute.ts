function searchMatrix(matrix: number[][], target: number): boolean {
  return matrix.some((row) => row.includes(target))
}
