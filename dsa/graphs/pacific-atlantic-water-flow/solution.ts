function pacificAtlantic(heights: number[][]): number[][] {
  const m = heights.length
  const n = heights[0].length

  // Every cell reachable by walking uphill from the given ocean-edge cells.
  const climb = (starts: number[][]): boolean[][] => {
    const seen = heights.map((row) => row.map(() => false))
    const stack: number[][] = []
    for (const [r, c] of starts) {
      if (seen[r][c]) continue
      seen[r][c] = true
      stack.push([r, c])
    }
    while (stack.length) {
      const [r, c] = stack.pop()!
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc]) continue
        if (heights[nr][nc] < heights[r][c]) continue
        seen[nr][nc] = true
        stack.push([nr, nc])
      }
    }
    return seen
  }

  const pacificEdge: number[][] = []
  const atlanticEdge: number[][] = []
  for (let r = 0; r < m; r++) {
    pacificEdge.push([r, 0])
    atlanticEdge.push([r, n - 1])
  }
  for (let c = 0; c < n; c++) {
    pacificEdge.push([0, c])
    atlanticEdge.push([m - 1, c])
  }
  const pac = climb(pacificEdge)
  const atl = climb(atlanticEdge)

  const result: number[][] = []
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (pac[r][c] && atl[r][c]) result.push([r, c])
  return result
}
