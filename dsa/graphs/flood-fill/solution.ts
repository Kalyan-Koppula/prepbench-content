function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {
  const start = image[sr][sc]
  if (start === color) {
    return image // nothing would change, and the search would never stop
  }
  const rows = image.length
  const cols = image[0].length
  const dr = [1, -1, 0, 0]
  const dc = [0, 0, 1, -1]
  // Iterative DFS over cells, stored as r * cols + c.
  const stack: number[] = [sr * cols + sc]
  image[sr][sc] = color
  while (stack.length > 0) {
    const cell = stack.pop() as number
    const r = Math.floor(cell / cols)
    const c = cell % cols
    for (let d = 0; d < 4; d++) {
      const nr = r + dr[d]
      const nc = c + dc[d]
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || image[nr][nc] !== start) {
        continue
      }
      image[nr][nc] = color // paint when pushing, so a pixel is never pushed twice
      stack.push(nr * cols + nc)
    }
  }
  return image
}
