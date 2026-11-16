function isNStraightHand(hand: number[], groupSize: number): boolean {
  const cards = [...hand].sort((a, b) => a - b)
  while (cards.length > 0) {
    const first = cards.shift()!
    for (let v = first + 1; v < first + groupSize; v++) {
      const idx = cards.indexOf(v)
      if (idx === -1) return false
      cards.splice(idx, 1)
    }
  }
  return true
}
