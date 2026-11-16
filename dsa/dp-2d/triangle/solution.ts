function minimumTotal(triangle: number[][]): number {
  // below[j] = cheapest path from position j of the row below down to the bottom.
  const below = [...triangle[triangle.length - 1]]
  for (let i = triangle.length - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      below[j] = triangle[i][j] + Math.min(below[j], below[j + 1])
    }
  }
  return below[0]
}
