function longestConsecutive(nums: number[]): number {
  if (nums.length === 0) {
    return 0
  }
  // Sorting puts every run side by side; this is the O(n log n) "better" approach.
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b)
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) {
      continue // a duplicate neither extends nor breaks the run
    }
    if (sorted[i] === sorted[i - 1] + 1) {
      run++
    } else {
      run = 1
    }
    if (run > best) {
      best = run
    }
  }
  return best
}
