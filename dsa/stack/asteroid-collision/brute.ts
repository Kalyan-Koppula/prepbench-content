function asteroidCollision(asteroids: number[]): number[] {
  // Resolve any adjacent (right-mover, left-mover) pair until none remain.
  let row = asteroids.slice()
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < row.length; i++) {
      if (row[i] > 0 && row[i + 1] < 0) {
        const left = row[i]
        const right = -row[i + 1]
        const next: number[] = []
        for (let j = 0; j < row.length; j++) {
          const destroyed = (j === i && left <= right) || (j === i + 1 && right <= left)
          if (!destroyed) {
            next.push(row[j])
          }
        }
        row = next
        changed = true
        break
      }
    }
  }
  return row
}
