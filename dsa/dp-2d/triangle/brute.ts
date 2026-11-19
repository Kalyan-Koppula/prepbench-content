// Top-down: best[i][j] = cheapest path from the apex to (i, j); the answer is
// the smallest value in the last row.
function minimumTotal(triangle: number[][]): number {
  const rows = triangle.length
  const best: number[][] = []
  for (let i = 0; i < rows; i++) {
    best.push(new Array(i + 1).fill(0))
  }
  best[0][0] = triangle[0][0]
  for (let i = 1; i < rows; i++) {
    for (let j = 0; j <= i; j++) {
      let fromAbove = Infinity
      if (j < i) {
        fromAbove = best[i - 1][j] // directly above
      }
      if (j > 0 && best[i - 1][j - 1] < fromAbove) {
        fromAbove = best[i - 1][j - 1] // above and to the left
      }
      best[i][j] = triangle[i][j] + fromAbove
    }
  }
  let answer = Infinity
  for (let j = 0; j < rows; j++) {
    if (best[rows - 1][j] < answer) {
      answer = best[rows - 1][j]
    }
  }
  return answer
}
