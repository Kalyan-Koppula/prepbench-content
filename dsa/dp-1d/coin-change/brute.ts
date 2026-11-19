function coinChange(coins: number[], amount: number): number {
  // BFS over remaining amounts: each level uses one more coin, so the first
  // time we reach 0, the level is the answer. Same O(amount * coins), different shape.
  const seen = new Array(amount + 1).fill(false)
  seen[amount] = true
  let level: number[] = [amount]
  let used = 0
  while (level.length > 0) {
    const next: number[] = []
    for (let i = 0; i < level.length; i++) {
      if (level[i] === 0) {
        return used
      }
      for (let c = 0; c < coins.length; c++) {
        const rest = level[i] - coins[c]
        if (rest >= 0 && !seen[rest]) {
          seen[rest] = true
          next.push(rest)
        }
      }
    }
    level = next
    used++
  }
  return -1
}
