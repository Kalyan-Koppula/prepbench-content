// Try every one of the 2^n sign assignments.
function findTargetSumWays(nums: number[], target: number): number {
  const go = (i: number, sum: number): number =>
    i === nums.length ? (sum === target ? 1 : 0) : go(i + 1, sum + nums[i]) + go(i + 1, sum - nums[i])
  return go(0, 0)
}
