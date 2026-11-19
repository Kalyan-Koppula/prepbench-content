function lastStoneWeight(stones: number[]): number {
  // Find the two heaviest with a linear scan each round: O(n^2).
  const pile = stones.slice()
  while (pile.length > 1) {
    let a = 0
    for (let i = 1; i < pile.length; i++) {
      if (pile[i] > pile[a]) {
        a = i
      }
    }
    const heaviest = pile[a]
    pile[a] = pile[pile.length - 1]
    pile.pop()
    let b = 0
    for (let i = 1; i < pile.length; i++) {
      if (pile[i] > pile[b]) {
        b = i
      }
    }
    const second = pile[b]
    pile[b] = pile[pile.length - 1]
    pile.pop()
    if (heaviest > second) {
      pile.push(heaviest - second)
    }
  }
  return pile.length === 0 ? 0 : pile[0]
}
