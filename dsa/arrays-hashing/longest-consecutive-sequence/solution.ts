function longestConsecutive(nums: number[]): number {
  const values = new Set<number>()
  for (let i = 0; i < nums.length; i++) {
    values.add(nums[i])
  }

  let best = 0
  for (const x of values) {
    // Only count from the start of a run, so each run is walked once.
    if (values.has(x - 1)) {
      continue
    }
    let length = 1
    while (values.has(x + length)) {
      length++
    }
    if (length > best) {
      best = length
    }
  }
  return best
}
