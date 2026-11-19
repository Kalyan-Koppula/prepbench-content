function trace(board: string[][], used: boolean[][], word: string, i: number, r: number, c: number): boolean {
  if (r < 0 || c < 0 || r >= board.length || c >= board[0].length) {
    return false
  }
  if (used[r][c] || board[r][c] !== word[i]) {
    return false
  }
  if (i === word.length - 1) {
    return true
  }
  used[r][c] = true
  const ok =
    trace(board, used, word, i + 1, r + 1, c) ||
    trace(board, used, word, i + 1, r - 1, c) ||
    trace(board, used, word, i + 1, r, c + 1) ||
    trace(board, used, word, i + 1, r, c - 1)
  used[r][c] = false
  return ok
}

function findWords(board: string[][], words: string[]): string[] {
  // Search for each word separately (Word Search, once per word).
  const used: boolean[][] = []
  for (let r = 0; r < board.length; r++) {
    used.push(new Array(board[0].length).fill(false))
  }
  const result: string[] = []
  for (let w = 0; w < words.length; w++) {
    let found = false
    for (let r = 0; r < board.length && !found; r++) {
      for (let c = 0; c < board[0].length && !found; c++) {
        if (trace(board, used, words[w], 0, r, c)) {
          found = true
        }
      }
    }
    if (found) {
      result.push(words[w])
    }
  }
  return result
}
