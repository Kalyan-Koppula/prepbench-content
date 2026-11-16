function solveSudoku(board: string[][]): void {
  const canPlace = (r: number, c: number, d: string) => {
    for (let k = 0; k < 9; k++) {
      if (board[r][k] === d || board[k][c] === d) return false
      const br = 3 * Math.floor(r / 3) + Math.floor(k / 3)
      const bc = 3 * Math.floor(c / 3) + (k % 3)
      if (board[br][bc] === d) return false
    }
    return true
  }
  const solve = (): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== '.') continue
        for (const d of '123456789') {
          if (!canPlace(r, c, d)) continue
          board[r][c] = d
          if (solve()) return true
          board[r][c] = '.'
        }
        return false
      }
    }
    return true
  }
  solve()
}
