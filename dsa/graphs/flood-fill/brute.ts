function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {
  const m = image.length
  const n = image[0].length
  const start = image[sr][sc]
  const inFill = image.map((row) => row.map(() => false))
  inFill[sr][sc] = true
  // Grow the region one ring at a time until nothing new joins.
  let changed = true
  while (changed) {
    changed = false
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) {
        if (inFill[r][c] || image[r][c] !== start) continue
        const touches =
          (r > 0 && inFill[r - 1][c]) || (r < m - 1 && inFill[r + 1][c]) || (c > 0 && inFill[r][c - 1]) || (c < n - 1 && inFill[r][c + 1])
        if (touches) {
          inFill[r][c] = true
          changed = true
        }
      }
  }
  return image.map((row, r) => row.map((v, c) => (inFill[r][c] ? color : v)))
}
