function minimumTotal(triangle: number[][]): number {
  const rows = triangle.length
  // below[j] = cheapest path from position j of the current row down to the bottom.
  // Start with the bottom row itself.
  const below: number[] = []
  for (let j = 0; j < rows; j++) {
    below.push(triangle[rows - 1][j])
  }
  for (let i = rows - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      below[j] = triangle[i][j] + Math.min(below[j], below[j + 1])
    }
  }
  return below[0]
}
