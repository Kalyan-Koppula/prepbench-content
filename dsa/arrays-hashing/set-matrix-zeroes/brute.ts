function setZeroes(matrix: number[][]): void {
  const zeros: [number, number][] = []
  for (let r = 0; r < matrix.length; r++)
    for (let c = 0; c < matrix[0].length; c++) if (matrix[r][c] === 0) zeros.push([r, c])
  for (const [r, c] of zeros) {
    for (let k = 0; k < matrix[0].length; k++) matrix[r][k] = 0
    for (let k = 0; k < matrix.length; k++) matrix[k][c] = 0
  }
}
