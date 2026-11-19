function exist(board: string[][], word: string): boolean {
  // Breadth-first over whole paths: keep every partial path that spells a
  // prefix of the word, as a list of cell indices (r * cols + c).
  const rows = board.length
  const cols = board[0].length
  let paths: number[][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === word[0]) {
        paths.push([r * cols + c])
      }
    }
  }
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  for (let i = 1; i < word.length && paths.length > 0; i++) {
    const next: number[][] = []
    for (let p = 0; p < paths.length; p++) {
      const path = paths[p]
      const last = path[path.length - 1]
      const r = Math.floor(last / cols)
      const c = last % cols
      for (let d = 0; d < 4; d++) {
        const nr = r + dr[d]
        const nc = c + dc[d]
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || board[nr][nc] !== word[i]) {
          continue
        }
        const cell = nr * cols + nc
        let onPath = false
        for (let k = 0; k < path.length; k++) {
          if (path[k] === cell) {
            onPath = true
            break
          }
        }
        if (!onPath) {
          const extended = path.slice()
          extended.push(cell)
          next.push(extended)
        }
      }
    }
    paths = next
  }
  return paths.length > 0
}
