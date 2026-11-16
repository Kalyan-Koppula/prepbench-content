function isValidSudoku(board: string[][]): boolean {
  const cells: [number, number, string][] = []
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board[r][c] !== '.') cells.push([r, c, board[r][c]])
  for (let i = 0; i < cells.length; i++)
    for (let j = i + 1; j < cells.length; j++) {
      const [r1, c1, d1] = cells[i]
      const [r2, c2, d2] = cells[j]
      if (d1 !== d2) continue
      const sameBox = Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3)
      if (r1 === r2 || c1 === c2 || sameBox) return false
    }
  return true
}
