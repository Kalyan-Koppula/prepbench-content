// BFS over remaining amounts: the first time we hit 0, the depth is the coin count.
function coinChange(coins: number[], amount: number): number {
  const seen = new Set<number>([amount])
  let frontier = [amount]
  for (let depth = 0; frontier.length; depth++) {
    const next: number[] = []
    for (const rest of frontier) {
      if (rest === 0) return depth
      for (const c of coins) {
        const r = rest - c
        if (r >= 0 && !seen.has(r)) {
          seen.add(r)
          next.push(r)
        }
      }
    }
    frontier = next
  }
  return -1
}
