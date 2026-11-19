// House Robber on the straight row nums[lo..hi].
function robRange(nums: number[], lo: number, hi: number): number {
  let twoBack = 0
  let oneBack = 0
  for (let i = lo; i <= hi; i++) {
    const robIt = twoBack + nums[i]
    const current = robIt > oneBack ? robIt : oneBack
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}

function rob(nums: number[]): number {
  const n = nums.length
  if (n === 1) {
    return nums[0]
  }
  // The first and last houses can't both be robbed, so drop one of them.
  const withoutLast = robRange(nums, 0, n - 2)
  const withoutFirst = robRange(nums, 1, n - 1)
  return withoutLast > withoutFirst ? withoutLast : withoutFirst
}
