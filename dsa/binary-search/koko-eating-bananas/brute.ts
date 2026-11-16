function minEatingSpeed(piles: number[], h: number): number {
  // Any speed below ceil(total / h) can't possibly finish; scan upward from there.
  const total = piles.reduce((a, b) => a + b, 0)
  for (let k = Math.max(1, Math.ceil(total / h)); ; k++) {
    let hours = 0
    for (const pile of piles) hours += Math.ceil(pile / k)
    if (hours <= h) return k
  }
}
