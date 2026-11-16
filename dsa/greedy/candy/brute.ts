function candy(ratings: number[]): number {
  // Keep fixing violations until none remain.
  const n = ratings.length
  const given: number[] = new Array(n).fill(1)
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < n; i++) {
      if (i > 0 && ratings[i] > ratings[i - 1] && given[i] <= given[i - 1]) {
        given[i] = given[i - 1] + 1
        changed = true
      }
      if (i < n - 1 && ratings[i] > ratings[i + 1] && given[i] <= given[i + 1]) {
        given[i] = given[i + 1] + 1
        changed = true
      }
    }
  }
  return given.reduce((sum, c) => sum + c, 0)
}
