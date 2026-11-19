function isValidSudoku(board: string[][]): boolean {
  // seenRow[r][d] is true once digit d has appeared in row r (same for columns and boxes).
  const seenRow: boolean[][] = []
  const seenCol: boolean[][] = []
  const seenBox: boolean[][] = []
  for (let i = 0; i < 9; i++) {
    seenRow.push(new Array(10).fill(false))
    seenCol.push(new Array(10).fill(false))
    seenBox.push(new Array(10).fill(false))
  }

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === '.') {
        continue
      }
      const d = board[r][c].charCodeAt(0) - 48 // '1'..'9' -> 1..9
      // Boxes are numbered 0..8, left to right, top to bottom.
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3)
      if (seenRow[r][d] || seenCol[c][d] || seenBox[b][d]) {
        return false
      }
      seenRow[r][d] = true
      seenCol[c][d] = true
      seenBox[b][d] = true
    }
  }
  return true
}
