function aggressiveCows(stalls: number[], k: number): number {
  const positions = stalls.slice()
  positions.sort((a, b) => a - b)
  const span = positions[positions.length - 1] - positions[0]
  // No gap can exceed span / (k - 1); try gaps downward from there.
  for (let gap = Math.floor(span / (k - 1)); gap > 1; gap--) {
    let placed = 1
    let last = positions[0]
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] - last >= gap) {
        placed++
        last = positions[i]
      }
    }
    if (placed >= k) {
      return gap
    }
  }
  return 1
}
