function climbStairs(n: number): number {
  // Count directly: a sequence with k two-steps has n - k moves in total, and
  // the k two-steps can sit in any C(n - k, k) of those positions.
  let total = 0
  for (let k = 0; 2 * k <= n; k++) {
    const moves = n - k
    // C(moves, k), built up one factor at a time (stays an exact integer).
    let ways = 1
    for (let i = 1; i <= k; i++) {
      ways = (ways * (moves - k + i)) / i
    }
    total += Math.round(ways)
  }
  return total
}
