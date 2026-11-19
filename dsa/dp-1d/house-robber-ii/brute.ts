// O(n^2) "last robbed house" DP on nums[lo..hi].
function robLine(nums: number[], lo: number, hi: number): number {
  const endAt: number[] = []
  let best = 0
  for (let i = lo; i <= hi; i++) {
    let before = 0
    for (let j = lo; j <= i - 2; j++) {
      if (endAt[j - lo] > before) {
        before = endAt[j - lo]
      }
    }
    endAt.push(before + nums[i])
    if (endAt[i - lo] > best) {
      best = endAt[i - lo]
    }
  }
  return best
}

function rob(nums: number[]): number {
  const n = nums.length
  if (n === 1) {
    return nums[0]
  }
  const a = robLine(nums, 0, n - 2)
  const b = robLine(nums, 1, n - 1)
  return a > b ? a : b
}
