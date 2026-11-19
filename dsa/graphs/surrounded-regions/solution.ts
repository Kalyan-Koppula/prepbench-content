function solve(board: string[][]): void {
  const rows = board.length
  const cols = board[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]

  // Mark every 'O' connected to (r, c) as safe ('S'): it reaches the border.
  function markSafe(r: number, c: number): void {
    if (board[r][c] !== 'O') {
      return
    }
    board[r][c] = 'S'
    const stack: number[] = [r * cols + c]
    while (stack.length > 0) {
      const cell = stack.pop() as number
      const cr = Math.floor(cell / cols)
      const cc = cell % cols
      for (let d = 0; d < 4; d++) {
        const nr = cr + dr[d]
        const nc = cc + dc[d]
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || board[nr][nc] !== 'O') {
          continue
        }
        board[nr][nc] = 'S'
        stack.push(nr * cols + nc)
      }
    }
  }

  // 1. Flood from every border 'O'.
  for (let r = 0; r < rows; r++) {
    markSafe(r, 0)
    markSafe(r, cols - 1)
  }
  for (let c = 0; c < cols; c++) {
    markSafe(0, c)
    markSafe(rows - 1, c)
  }
  // 2. Unmarked 'O's are captured; safe ones go back to 'O'.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') {
        board[r][c] = 'X'
      } else if (board[r][c] === 'S') {
        board[r][c] = 'O'
      }
    }
  }
}
