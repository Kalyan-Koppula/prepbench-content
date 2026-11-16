function findWords(board: string[][], words: string[]): string[] {
  const rows = board.length
  const cols = board[0].length
  const used = board.map((row) => row.map(() => false))

  const trace = (word: string, i: number, r: number, c: number): boolean => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || used[r][c] || board[r][c] !== word[i]) return false
    if (i === word.length - 1) return true
    used[r][c] = true
    const ok =
      trace(word, i + 1, r + 1, c) || trace(word, i + 1, r - 1, c) || trace(word, i + 1, r, c + 1) || trace(word, i + 1, r, c - 1)
    used[r][c] = false
    return ok
  }

  return words.filter((w) => {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (trace(w, 0, r, c)) return true
    return false
  })
}
