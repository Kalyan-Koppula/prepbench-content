function candy(ratings: number[]): number {
  const n = ratings.length
  const given: number[] = new Array(n).fill(1)
  // Left rule: beat the left neighbour if rated higher.
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) given[i] = given[i - 1] + 1
  }
  // Right rule: beat the right neighbour too, without breaking the left rule.
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) given[i] = Math.max(given[i], given[i + 1] + 1)
  }
  return given.reduce((sum, c) => sum + c, 0)
}
