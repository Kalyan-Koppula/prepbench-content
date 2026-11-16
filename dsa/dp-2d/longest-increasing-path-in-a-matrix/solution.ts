function longestIncreasingPath(matrix: number[][]): number {
  const m = matrix.length
  const n = matrix[0].length
  const memo: number[][] = Array.from({ length: m }, () => new Array(n).fill(0)) // 0 = not computed
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]

  // Longest strictly increasing path starting at (r, c).
  const dfs = (r: number, c: number): number => {
    if (memo[r][c]) return memo[r][c]
    let best = 1
    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
        best = Math.max(best, 1 + dfs(nr, nc))
      }
    }
    memo[r][c] = best
    return best
  }

  let answer = 0
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) answer = Math.max(answer, dfs(r, c))
  return answer
}
