// Can k cows be placed so that every two are at least `gap` apart? Greedy from the left.
function canPlace(positions: number[], k: number, gap: number): boolean {
  let placed = 1
  let last = positions[0]
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] - last >= gap) {
      placed++
      last = positions[i]
      if (placed >= k) {
        return true
      }
    }
  }
  return placed >= k
}

function aggressiveCows(stalls: number[], k: number): number {
  const positions = stalls.slice()
  positions.sort((a, b) => a - b)
  // The answer is between 1 and the full span.
  let lo = 1
  let hi = positions[positions.length - 1] - positions[0]
  while (lo < hi) {
    // Round up: on success we set lo = mid, so mid must be > lo to make progress.
    const mid = lo + Math.ceil((hi - lo) / 2)
    if (canPlace(positions, k, mid)) {
      lo = mid // mid works; try a larger gap
    } else {
      hi = mid - 1
    }
  }
  return lo
}
