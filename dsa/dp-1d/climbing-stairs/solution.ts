function climbStairs(n: number): number {
  // ways(i) = ways(i - 1) + ways(i - 2): the last move was 1 step or 2 steps.
  let twoBack = 1 // ways(0)
  let oneBack = 1 // ways(1)
  for (let i = 2; i <= n; i++) {
    const current = oneBack + twoBack
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}
