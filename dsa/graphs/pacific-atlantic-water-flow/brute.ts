function pacificAtlantic(heights: number[][]): number[][] {
  // From every cell, follow water downhill and see which oceans it reaches:
  // O((m * n)^2).
  const rows = heights.length
  const cols = heights[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const result: number[][] = []
  for (let sr = 0; sr < rows; sr++) {
    for (let sc = 0; sc < cols; sc++) {
      const seen: boolean[][] = []
      for (let r = 0; r < rows; r++) {
        seen.push(new Array(cols).fill(false))
      }
      seen[sr][sc] = true
      const stack: number[] = [sr * cols + sc]
      let pacific = false
      let atlantic = false
      while (stack.length > 0 && !(pacific && atlantic)) {
        const cell = stack.pop() as number
        const r = Math.floor(cell / cols)
        const c = cell % cols
        if (r === 0 || c === 0) {
          pacific = true
        }
        if (r === rows - 1 || c === cols - 1) {
          atlantic = true
        }
        for (let d = 0; d < 4; d++) {
          const nr = r + dr[d]
          const nc = c + dc[d]
          if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc] || heights[nr][nc] > heights[r][c]) {
            continue
          }
          seen[nr][nc] = true
          stack.push(nr * cols + nc)
        }
      }
      if (pacific && atlantic) {
        result.push([sr, sc])
      }
    }
  }
  return result
}
