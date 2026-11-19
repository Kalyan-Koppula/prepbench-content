function isNStraightHand(hand: number[], groupSize: number): boolean {
  if (hand.length % groupSize !== 0) {
    return false
  }
  const count = new Map<number, number>()
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i]
    if (count.has(card)) {
      count.set(card, (count.get(card) as number) + 1)
    } else {
      count.set(card, 1)
    }
  }
  const sorted: number[] = []
  for (let i = 0; i < hand.length; i++) {
    sorted.push(hand[i])
  }
  sorted.sort((a, b) => a - b)

  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i]
    const copies = count.get(start) as number
    if (copies === 0) {
      continue // already used up by earlier groups
    }
    // The smallest card left must start a group; every copy of it starts its own.
    for (let v = start; v < start + groupSize; v++) {
      const have = count.has(v) ? (count.get(v) as number) : 0
      if (have < copies) {
        return false
      }
      count.set(v, have - copies)
    }
  }
  return true
}
