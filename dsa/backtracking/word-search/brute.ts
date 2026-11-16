function exist(board: string[][], word: string): boolean {
  // Grow every partial path (list of cells) one letter at a time, breadth-first.
  const rows = board.length
  const cols = board[0].length
  let paths: number[][][] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (board[r][c] === word[0]) paths.push([[r, c]])
  for (let i = 1; i < word.length && paths.length; i++) {
    const next: number[][][] = []
    for (const path of paths) {
      const [r, c] = path[path.length - 1]
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || board[nr][nc] !== word[i]) continue
        if (path.some(([pr, pc]) => pr === nr && pc === nc)) continue
        next.push([...path, [nr, nc]])
      }
    }
    paths = next
  }
  return paths.length > 0
}
