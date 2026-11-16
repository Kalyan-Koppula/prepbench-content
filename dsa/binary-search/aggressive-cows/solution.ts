function aggressiveCows(stalls: number[], k: number): number {
  const pos = [...stalls].sort((a, b) => a - b)
  const canPlace = (gap: number) => {
    let placed = 1
    let last = pos[0]
    for (let i = 1; i < pos.length && placed < k; i++) {
      if (pos[i] - last >= gap) {
        placed++
        last = pos[i]
      }
    }
    return placed >= k
  }
  let lo = 1
  let hi = pos[pos.length - 1] - pos[0]
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2) // round up: we move lo = mid on success
    if (canPlace(mid)) lo = mid
    else hi = mid - 1
  }
  return lo
}
