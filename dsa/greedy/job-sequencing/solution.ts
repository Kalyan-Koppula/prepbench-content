function jobSequencing(deadline: number[], profit: number[]): number[] {
  const n = deadline.length
  const order = [...Array(n).keys()].sort((a, b) => profit[b] - profit[a])

  // freeSlot[t] points toward the latest free slot <= t; slot 0 means "none left".
  const freeSlot = Array.from({ length: n + 1 }, (_, t) => t)
  const find = (t: number): number => {
    while (freeSlot[t] !== t) {
      freeSlot[t] = freeSlot[freeSlot[t]] // path halving
      t = freeSlot[t]
    }
    return t
  }

  let jobsDone = 0
  let maxProfit = 0
  for (const j of order) {
    const slot = find(deadline[j])
    if (slot === 0) continue
    freeSlot[slot] = slot - 1 // occupied: future lookups fall through to earlier slots
    jobsDone++
    maxProfit += profit[j]
  }
  return [jobsDone, maxProfit]
}
