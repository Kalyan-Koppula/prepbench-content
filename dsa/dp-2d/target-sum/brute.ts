// Try both signs for every number: 2^n assignments (n is at most 20).
function findTargetSumWays(nums: number[], target: number): number {
  return countSigns(nums, target, 0, 0)
}

function countSigns(nums: number[], target: number, i: number, sum: number): number {
  if (i === nums.length) {
    return sum === target ? 1 : 0
  }
  return countSigns(nums, target, i + 1, sum + nums[i]) + countSigns(nums, target, i + 1, sum - nums[i])
}
