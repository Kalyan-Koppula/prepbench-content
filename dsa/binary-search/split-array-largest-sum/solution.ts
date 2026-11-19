// Fewest pieces needed if no piece may sum to more than `limit`, cutting greedily.
function piecesNeeded(nums: number[], limit: number): number {
  let pieces = 1
  let sum = 0
  for (let i = 0; i < nums.length; i++) {
    if (sum + nums[i] > limit) {
      pieces++
      sum = 0
    }
    sum += nums[i]
  }
  return pieces
}

function splitArray(nums: number[], k: number): number {
  // The largest piece is at least the biggest element and at most the total.
  let lo = 0
  let hi = 0
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > lo) {
      lo = nums[i]
    }
    hi += nums[i]
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (piecesNeeded(nums, mid) <= k) {
      hi = mid // a limit of mid is achievable with k pieces (extra cuts never hurt)
    } else {
      lo = mid + 1
    }
  }
  return lo
}
