// Number of subarrays of nums with at most `limit` distinct values.
function countAtMost(nums: number[], limit: number): number {
  const count = new Map<number, number>()
  let left = 0
  let total = 0
  for (let right = 0; right < nums.length; right++) {
    const added = nums[right]
    const before = count.get(added)
    if (before === undefined) {
      count.set(added, 1)
    } else {
      count.set(added, before + 1)
    }

    while (count.size > limit) {
      const removed = nums[left]
      const remaining = (count.get(removed) as number) - 1
      if (remaining === 0) {
        count.delete(removed)
      } else {
        count.set(removed, remaining)
      }
      left++
    }

    // Every start from left to right gives a valid subarray ending at right.
    total += right - left + 1
  }
  return total
}

function subarraysWithKDistinct(nums: number[], k: number): number {
  // Exactly k = (at most k) - (at most k - 1).
  return countAtMost(nums, k) - countAtMost(nums, k - 1)
}
