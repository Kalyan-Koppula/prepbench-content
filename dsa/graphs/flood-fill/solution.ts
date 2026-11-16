function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {
  const start = image[sr][sc]
  if (start === color) return image
  const m = image.length
  const n = image[0].length
  const stack: number[][] = [[sr, sc]]
  image[sr][sc] = color
  while (stack.length) {
    const [r, c] = stack.pop()!
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      if (nr < 0 || nc < 0 || nr >= m || nc >= n || image[nr][nc] !== start) continue
      image[nr][nc] = color // paint on push so a pixel is never pushed twice
      stack.push([nr, nc])
    }
  }
  return image
}
