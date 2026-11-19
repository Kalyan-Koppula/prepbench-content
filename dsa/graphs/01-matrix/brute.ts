function updateMatrix(mat: number[][]): number[][] {
  // With no walls, the grid distance is the Manhattan distance; check every zero
  // for every cell: O((m * n)^2).
  const rows = mat.length
  const cols = mat[0].length
  const zeroRows: number[] = []
  const zeroCols: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mat[r][c] === 0) {
        zeroRows.push(r)
        zeroCols.push(c)
      }
    }
  }
  const result: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < cols; c++) {
      let best = Infinity
      for (let z = 0; z < zeroRows.length; z++) {
        const d = Math.abs(zeroRows[z] - r) + Math.abs(zeroCols[z] - c)
        if (d < best) {
          best = d
        }
      }
      row.push(best)
    }
    result.push(row)
  }
  return result
}
