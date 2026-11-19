function candy(ratings: number[]): number {
  const n = ratings.length
  const given = new Array(n).fill(1)
  // Left pass: a child rated higher than the left neighbour gets one more than it.
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      given[i] = given[i - 1] + 1
    }
  }
  // Right pass: the same against the right neighbour, keeping the left rule satisfied.
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1] && given[i] <= given[i + 1]) {
      given[i] = given[i + 1] + 1
    }
  }
  let total = 0
  for (let i = 0; i < n; i++) {
    total += given[i]
  }
  return total
}
