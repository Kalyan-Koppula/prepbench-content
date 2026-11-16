function asteroidCollision(asteroids: number[]): number[] {
  // Resolve any adjacent (right-mover, left-mover) pair until none remain.
  const row = [...asteroids]
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < row.length; i++) {
      if (row[i] > 0 && row[i + 1] < 0) {
        const l = row[i], r = -row[i + 1]
        if (l === r) row.splice(i, 2)
        else if (l > r) row.splice(i + 1, 1)
        else row.splice(i, 1)
        changed = true
        break
      }
    }
  }
  return row
}
