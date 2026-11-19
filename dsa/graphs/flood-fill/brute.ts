function paint(image: number[][], r: number, c: number, start: number, color: number): void {
  if (r < 0 || c < 0 || r >= image.length || c >= image[0].length) {
    return
  }
  if (image[r][c] !== start) {
    return
  }
  image[r][c] = color
  paint(image, r + 1, c, start, color)
  paint(image, r - 1, c, start, color)
  paint(image, r, c + 1, start, color)
  paint(image, r, c - 1, start, color)
}

function floodFill(image: number[][], sr: number, sc: number, color: number): number[][] {
  // Recursive DFS: same O(m * n), but the recursion can be as deep as the region.
  const start = image[sr][sc]
  if (start !== color) {
    paint(image, sr, sc, start, color)
  }
  return image
}
