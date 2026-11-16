function solve(board: string[][]): void {
  const m = board.length
  const n = board[0].length
  const seen = board.map((row) => row.map(() => false))
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (board[r][c] !== 'O' || seen[r][c]) continue
      // Collect the whole region, noting whether any cell is on the border.
      const region: number[][] = [[r, c]]
      seen[r][c] = true
      let escapes = false
      for (let i = 0; i < region.length; i++) {
        const [cr, cc] = region[i]
        if (cr === 0 || cc === 0 || cr === m - 1 || cc === n - 1) escapes = true
        for (const [nr, nc] of [[cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc] || board[nr][nc] !== 'O') continue
          seen[nr][nc] = true
          region.push([nr, nc])
        }
      }
      if (!escapes) for (const [cr, cc] of region) board[cr][cc] = 'X'
    }
}
