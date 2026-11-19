// Combinatorics: a route is m + n - 2 moves, of which m - 1 go down.
// Count the ways to choose them: C(m + n - 2, m - 1), built one factor at a time.
function uniquePaths(m: number, n: number): number {
  const total = m + n - 2
  let k = m - 1
  if (n - 1 < k) {
    k = n - 1
  }
  let result = 1
  for (let i = 1; i <= k; i++) {
    // After this step result = C(total - k + i, i), always a whole number.
    result = (result * (total - k + i)) / i
  }
  return Math.round(result)
}
