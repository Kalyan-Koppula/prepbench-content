// BFS over remainders: each level subtracts one more square.
function numSquares(n: number): number {
  const seen = new Array(n + 1).fill(false)
  let level: number[] = [n]
  seen[n] = true
  let squaresUsed = 0
  while (level.length > 0) {
    squaresUsed++
    const next: number[] = []
    for (let i = 0; i < level.length; i++) {
      const remaining = level[i]
      for (let k = 1; k * k <= remaining; k++) {
        const left = remaining - k * k
        if (left === 0) {
          return squaresUsed
        }
        if (!seen[left]) {
          seen[left] = true
          next.push(left)
        }
      }
    }
    level = next
  }
  return 0
}
