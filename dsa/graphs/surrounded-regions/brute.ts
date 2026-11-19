function solve(board: string[][]): void {
  // Find each region of 'O's from the inside, note whether it touches the
  // border, and capture it if it doesn't.
  const rows = board.length
  const cols = board[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const seen: boolean[][] = []
  for (let r = 0; r < rows; r++) {
    seen.push(new Array(cols).fill(false))
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== 'O' || seen[r][c]) {
        continue
      }
      const region: number[] = [r * cols + c]
      seen[r][c] = true
      let touchesBorder = false
      for (let i = 0; i < region.length; i++) {
        const cr = Math.floor(region[i] / cols)
        const cc = region[i] % cols
        if (cr === 0 || cc === 0 || cr === rows - 1 || cc === cols - 1) {
          touchesBorder = true
        }
        for (let d = 0; d < 4; d++) {
          const nr = cr + dr[d]
          const nc = cc + dc[d]
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc] || board[nr][nc] !== 'O') {
            continue
          }
          seen[nr][nc] = true
          region.push(nr * cols + nc)
        }
      }
      if (!touchesBorder) {
        for (let i = 0; i < region.length; i++) {
          board[Math.floor(region[i] / cols)][region[i] % cols] = 'X'
        }
      }
    }
  }
}
