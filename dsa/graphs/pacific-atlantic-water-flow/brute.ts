function pacificAtlantic(heights: number[][]): number[][] {
  const m = heights.length
  const n = heights[0].length
  const result: number[][] = []
  for (let sr = 0; sr < m; sr++)
    for (let sc = 0; sc < n; sc++) {
      // Follow the water downhill from this one cell.
      const seen = heights.map((row) => row.map(() => false))
      seen[sr][sc] = true
      const stack = [[sr, sc]]
      let pacific = false
      let atlantic = false
      while (stack.length) {
        const [r, c] = stack.pop()!
        if (r === 0 || c === 0) pacific = true
        if (r === m - 1 || c === n - 1) atlantic = true
        for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
          if (nr < 0 || nc < 0 || nr >= m || nc >= n || seen[nr][nc] || heights[nr][nc] > heights[r][c]) continue
          seen[nr][nc] = true
          stack.push([nr, nc])
        }
      }
      if (pacific && atlantic) result.push([sr, sc])
    }
  return result
}
