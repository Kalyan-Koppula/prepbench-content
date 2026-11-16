function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) return false
  const count = new Map<number, number>()
  for (const card of hand) count.set(card, (count.get(card) ?? 0) + 1)

  const values = [...count.keys()].sort((a, b) => a - b)
  for (const start of values) {
    const need = count.get(start)!
    if (need === 0) continue
    // Every remaining copy of `start` must open its own run.
    for (let v = start; v < start + groupSize; v++) {
      const have = count.get(v) ?? 0
      if (have < need) return false
      count.set(v, have - need)
    }
  }
  return true
}
