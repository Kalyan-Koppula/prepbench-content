function solve(board: string[][]): void {
  const m = board.length
  const n = board[0].length

  const markSafe = (sr: number, sc: number) => {
    if (board[sr][sc] !== 'O') return
    board[sr][sc] = 'S'
    const stack: number[][] = [[sr, sc]]
    while (stack.length) {
      const [r, c] = stack.pop()!
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || board[nr][nc] !== 'O') continue
        board[nr][nc] = 'S'
        stack.push([nr, nc])
      }
    }
  }

  for (let r = 0; r < m; r++) {
    markSafe(r, 0)
    markSafe(r, n - 1)
  }
  for (let c = 0; c < n; c++) {
    markSafe(0, c)
    markSafe(m - 1, c)
  }

  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (board[r][c] === 'O') board[r][c] = 'X'
      else if (board[r][c] === 'S') board[r][c] = 'O'
    }
}
