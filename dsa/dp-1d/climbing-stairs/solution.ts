function climbStairs(n: number): number {
  // ways(i) = ways(i - 1) + ways(i - 2); keep only the last two.
  let twoBack = 1 // ways(0)
  let oneBack = 1 // ways(1)
  for (let i = 2; i <= n; i++) {
    const cur = oneBack + twoBack
    twoBack = oneBack
    oneBack = cur
  }
  return oneBack
}
