const DR = [1, -1, 0, 0]
const DC = [0, 0, 1, -1]

function longestIncreasingPath(matrix: number[][]): number {
  const m = matrix.length
  const n = matrix[0].length
  // memo[r][c] = longest increasing path starting at (r, c); 0 = not computed yet.
  const memo: number[][] = []
  for (let r = 0; r < m; r++) {
    memo.push(new Array(n).fill(0))
  }
  let answer = 0
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const length = longestFrom(matrix, r, c, memo)
      if (length > answer) {
        answer = length
      }
    }
  }
  return answer
}

function longestFrom(matrix: number[][], r: number, c: number, memo: number[][]): number {
  if (memo[r][c] !== 0) {
    return memo[r][c]
  }
  let best = 1
  for (let d = 0; d < 4; d++) {
    const nr = r + DR[d]
    const nc = c + DC[d]
    if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length && matrix[nr][nc] > matrix[r][c]) {
      const length = 1 + longestFrom(matrix, nr, nc, memo)
      if (length > best) {
        best = length
      }
    }
  }
  memo[r][c] = best
  return best
}
