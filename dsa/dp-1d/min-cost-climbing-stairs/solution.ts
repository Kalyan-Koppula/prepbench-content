function minCostClimbingStairs(cost: number[]): number {
  // dp[i] = cheapest way to stand on position i (its own fee not paid yet).
  // Positions 0 and 1 are free starting points.
  let twoBack = 0 // dp[i - 2]
  let oneBack = 0 // dp[i - 1]
  for (let i = 2; i <= cost.length; i++) {
    // Arrive from i - 1 (paying its fee) or from i - 2 (paying its fee).
    const fromOne = oneBack + cost[i - 1]
    const fromTwo = twoBack + cost[i - 2]
    const current = fromOne < fromTwo ? fromOne : fromTwo
    twoBack = oneBack
    oneBack = current
  }
  return oneBack // position cost.length is the top
}
