function setZeroes(matrix: number[][]): void {
  const m = matrix.length
  const n = matrix[0].length

  // Read zeros from an untouched copy so new zeros never trigger more clearing.
  const original: number[][] = []
  for (let r = 0; r < m; r++) {
    original.push(matrix[r].slice())
  }

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (original[r][c] === 0) {
        for (let k = 0; k < n; k++) {
          matrix[r][k] = 0
        }
        for (let k = 0; k < m; k++) {
          matrix[k][c] = 0
        }
      }
    }
  }
}
