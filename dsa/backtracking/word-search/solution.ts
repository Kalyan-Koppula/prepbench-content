function trace(board: string[][], word: string, i: number, r: number, c: number): boolean {
  if (i === word.length) {
    return true // every letter matched
  }
  if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) {
    return false
  }
  if (board[r][c] !== word[i]) {
    return false // wrong letter, or '#' (already on this path)
  }
  const saved = board[r][c]
  board[r][c] = '#' // mark: this cell is on the current path
  const found =
    trace(board, word, i + 1, r + 1, c) ||
    trace(board, word, i + 1, r - 1, c) ||
    trace(board, word, i + 1, r, c + 1) ||
    trace(board, word, i + 1, r, c - 1)
  board[r][c] = saved // unmark before returning
  return found
}

function exist(board: string[][], word: string): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (trace(board, word, 0, r, c)) {
        return true
      }
    }
  }
  return false
}
