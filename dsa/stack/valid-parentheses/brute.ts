function isValid(s: string): boolean {
  // Repeatedly delete an adjacent matched pair until none is left.
  let current = s
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < current.length; i++) {
      const pair = current[i] + current[i + 1]
      if (pair === '()' || pair === '[]' || pair === '{}') {
        current = current.substring(0, i) + current.substring(i + 2)
        changed = true
        break
      }
    }
  }
  return current.length === 0
}
