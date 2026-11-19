function solveNQueens(n: number): string[][] {
  const result: string[][] = []
  const queenCol: number[] = [] // queenCol[r] = column of the queen in row r
  const colUsed = new Array(n).fill(false)
  const diagUsed = new Array(2 * n).fill(false) // "\" diagonals: r - c + n is constant
  const antiUsed = new Array(2 * n).fill(false) // "/" diagonals: r + c is constant

  function boardFromColumns(): string[] {
    const rows: string[] = []
    for (let r = 0; r < n; r++) {
      let row = ''
      for (let c = 0; c < n; c++) {
        row += c === queenCol[r] ? 'Q' : '.'
      }
      rows.push(row)
    }
    return rows
  }

  // Place one queen in row r, then the rows below it.
  function place(r: number): void {
    if (r === n) {
      result.push(boardFromColumns())
      return
    }
    for (let c = 0; c < n; c++) {
      if (colUsed[c] || diagUsed[r - c + n] || antiUsed[r + c]) {
        continue // attacked
      }
      colUsed[c] = true
      diagUsed[r - c + n] = true
      antiUsed[r + c] = true
      queenCol.push(c)
      place(r + 1)
      queenCol.pop()
      colUsed[c] = false
      diagUsed[r - c + n] = false
      antiUsed[r + c] = false
    }
  }

  place(0)
  return result
}
