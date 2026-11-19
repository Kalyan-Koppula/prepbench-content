function solveSudoku(board: string[][]): void {
  // rowHas[r][d]: digit d already appears in row r (same for columns and boxes).
  const rowHas: boolean[][] = []
  const colHas: boolean[][] = []
  const boxHas: boolean[][] = []
  for (let i = 0; i < 9; i++) {
    rowHas.push(new Array(10).fill(false))
    colHas.push(new Array(10).fill(false))
    boxHas.push(new Array(10).fill(false))
  }
  const emptyRows: number[] = []
  const emptyCols: number[] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === '.') {
        emptyRows.push(r)
        emptyCols.push(c)
      } else {
        const d = board[r][c].charCodeAt(0) - 48
        rowHas[r][d] = true
        colHas[c][d] = true
        boxHas[Math.floor(r / 3) * 3 + Math.floor(c / 3)][d] = true
      }
    }
  }

  // Fill empty cell k onwards; returns true once the whole board is solved.
  function solve(k: number): boolean {
    if (k === emptyRows.length) {
      return true
    }
    const r = emptyRows[k]
    const c = emptyCols[k]
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
    for (let d = 1; d <= 9; d++) {
      if (rowHas[r][d] || colHas[c][d] || boxHas[b][d]) {
        continue
      }
      rowHas[r][d] = true
      colHas[c][d] = true
      boxHas[b][d] = true
      board[r][c] = String(d)
      if (solve(k + 1)) {
        return true // keep the digits once a full solution is found
      }
      rowHas[r][d] = false
      colHas[c][d] = false
      boxHas[b][d] = false
    }
    board[r][c] = '.'
    return false // no digit works here: a choice above must change
  }

  solve(0)
}
