function minCostClimbingStairs(cost: number[]): number {
  // dp[i] = cheapest cost to stand on position i (fee for i not yet paid).
  let twoBack = 0 // dp[0]
  let oneBack = 0 // dp[1]
  for (let i = 2; i <= cost.length; i++) {
    const cur = Math.min(oneBack + cost[i - 1], twoBack + cost[i - 2])
    twoBack = oneBack
    oneBack = cur
  }
  return oneBack
}
