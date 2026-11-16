function aggressiveCows(stalls: number[], k: number): number {
  const pos = [...stalls].sort((a, b) => a - b)
  // Try gaps from the theoretical best downward; the first that fits is the answer.
  for (let gap = Math.floor((pos[pos.length - 1] - pos[0]) / (k - 1)); gap > 1; gap--) {
    let placed = 1
    let last = pos[0]
    for (const p of pos) {
      if (p - last >= gap) {
        placed++
        last = p
      }
    }
    if (placed >= k) return gap
  }
  return 1
}
