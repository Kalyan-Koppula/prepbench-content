// Start everyone at 1 and keep fixing violations until none remain.
function candy(ratings: number[]): number {
  const n = ratings.length
  const given = new Array(n).fill(1)
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
  let total = 0
  for (let i = 0; i < n; i++) {
    total += given[i]
  }
  return total
}
