// All cells reachable by walking uphill (or level) from the given starting cells.
function climbFrom(heights: number[][], starts: number[]): boolean[][] {
  const rows = heights.length
  const cols = heights[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  const seen: boolean[][] = []
  for (let r = 0; r < rows; r++) {
    seen.push(new Array(cols).fill(false))
  }
  const stack: number[] = []
  for (let i = 0; i < starts.length; i++) {
    const r = Math.floor(starts[i] / cols)
    const c = starts[i] % cols
    if (!seen[r][c]) {
      seen[r][c] = true
      stack.push(starts[i])
    }
  }
  while (stack.length > 0) {
    const cell = stack.pop() as number
    const r = Math.floor(cell / cols)
    const c = cell % cols
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d]
      const nc = c + dc[d]
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen[nr][nc]) {
        continue
      }
      // Water flows from the neighbour down to us only if it is at least as high.
      if (heights[nr][nc] < heights[r][c]) {
        continue
      }
      seen[nr][nc] = true
      stack.push(nr * cols + nc)
    }
  }
  return seen
}

function pacificAtlantic(heights: number[][]): number[][] {
  const rows = heights.length
  const cols = heights[0].length
  const pacificEdge: number[] = []
  const atlanticEdge: number[] = []
  for (let r = 0; r < rows; r++) {
    pacificEdge.push(r * cols) // left column
    atlanticEdge.push(r * cols + cols - 1) // right column
  }
  for (let c = 0; c < cols; c++) {
    pacificEdge.push(c) // top row
    atlanticEdge.push((rows - 1) * cols + c) // bottom row
  }
  const pacific = climbFrom(heights, pacificEdge)
  const atlantic = climbFrom(heights, atlanticEdge)
  const result: number[][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pacific[r][c] && atlantic[r][c]) {
        result.push([r, c])
      }
    }
  }
  return result
}
