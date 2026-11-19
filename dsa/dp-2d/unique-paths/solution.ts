function uniquePaths(m: number, n: number): number {
  // paths[i][j] = number of routes from the top-left corner to cell (i, j).
  const paths: number[][] = []
  for (let i = 0; i < m; i++) {
    paths.push(new Array(n).fill(0))
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 || j === 0) {
        paths[i][j] = 1 // the first row and column can only be reached one way
      } else {
        paths[i][j] = paths[i - 1][j] + paths[i][j - 1] // from above + from the left
      }
    }
  }
  return paths[m - 1][n - 1]
}
