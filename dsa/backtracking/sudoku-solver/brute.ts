function canPlace(board: string[][], r: number, c: number, d: string): boolean {
  // Scan the row, the column and the box: O(27) per check.
  for (let k = 0; k < 9; k++) {
    if (board[r][k] === d || board[k][c] === d) {
      return false
    }
    const br = 3 * Math.floor(r / 3) + Math.floor(k / 3)
    const bc = 3 * Math.floor(c / 3) + (k % 3)
    if (board[br][bc] === d) {
      return false
    }
  }
  return true
}

function solveFrom(board: string[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== '.') {
        continue
      }
      for (let d = 1; d <= 9; d++) {
        const digit = String(d)
        if (!canPlace(board, r, c, digit)) {
          continue
        }
        board[r][c] = digit
        if (solveFrom(board)) {
          return true
        }
        board[r][c] = '.'
      }
      return false // this empty cell can't be filled
    }
  }
  return true // no empty cells left
}

function solveSudoku(board: string[][]): void {
  solveFrom(board)
}
