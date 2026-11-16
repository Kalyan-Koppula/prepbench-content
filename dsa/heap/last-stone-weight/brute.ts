function lastStoneWeight(stones: number[]): number {
  const pile = [...stones]
  while (pile.length > 1) {
    pile.sort((a, b) => a - b)
    const y = pile.pop()!
    const x = pile.pop()!
    if (y > x) pile.push(y - x)
  }
  return pile[0] ?? 0
}
