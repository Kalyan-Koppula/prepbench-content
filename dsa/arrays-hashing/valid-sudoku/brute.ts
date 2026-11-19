function isValidSudoku(board: string[][]): boolean {
  // Compare every pair of filled cells: two equal digits may not share a row, column or box.
  for (let r1 = 0; r1 < 9; r1++) {
    for (let c1 = 0; c1 < 9; c1++) {
      if (board[r1][c1] === '.') {
        continue
      }
      for (let r2 = 0; r2 < 9; r2++) {
        for (let c2 = 0; c2 < 9; c2++) {
          if (r1 === r2 && c1 === c2) {
            continue
          }
          if (board[r2][c2] !== board[r1][c1]) {
            continue
          }
          const sameBox = Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3)
          if (r1 === r2 || c1 === c2 || sameBox) {
            return false
          }
        }
      }
    }
  }
  return true
}
