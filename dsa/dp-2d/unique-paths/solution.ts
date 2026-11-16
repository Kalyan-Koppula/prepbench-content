function uniquePaths(m: number, n: number): number {
  // row[j] = number of routes to column j of the current row.
  const row = new Array(n).fill(1) // first row: only by moving right
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      row[j] += row[j - 1] // from above (old row[j]) + from the left
    }
  }
  return row[n - 1]
}
