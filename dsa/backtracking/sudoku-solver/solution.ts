function solveSudoku(board: string[][]): void {
  const rows = new Array(9).fill(0) // bit d set = digit d already used
  const cols = new Array(9).fill(0)
  const boxes = new Array(9).fill(0)
  const empty: [number, number][] = []
  const boxOf = (r: number, c: number) => 3 * Math.floor(r / 3) + Math.floor(c / 3)

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === '.') {
        empty.push([r, c])
      } else {
        const bit = 1 << Number(board[r][c])
        rows[r] |= bit
        cols[c] |= bit
        boxes[boxOf(r, c)] |= bit
      }
    }
  }

  const solve = (k: number): boolean => {
    if (k === empty.length) return true
    const [r, c] = empty[k]
    const b = boxOf(r, c)
    const used = rows[r] | cols[c] | boxes[b]
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d
      if (used & bit) continue
      rows[r] |= bit
      cols[c] |= bit
      boxes[b] |= bit
      board[r][c] = String(d)
      if (solve(k + 1)) return true
      rows[r] ^= bit
      cols[c] ^= bit
      boxes[b] ^= bit
    }
    board[r][c] = '.'
    return false
  }

  solve(0)
}
