function nextPermutation(nums: number[]): void {
  const n = nums.length
  const current = nums.slice()
  const sorted = nums.slice()
  sorted.sort((a, b) => a - b)

  // Generate every distinct ordering in lexicographic order by always trying
  // the smaller unused value first. The ordering produced right after the
  // current one is the answer.
  const used = new Array(n).fill(false)
  const built: number[] = []
  let seenCurrent = false
  let answer: number[] = []

  function sameAsCurrent(): boolean {
    for (let i = 0; i < n; i++) {
      if (built[i] !== current[i]) {
        return false
      }
    }
    return true
  }

  // Returns true once the answer has been found, to stop the search.
  function generate(): boolean {
    if (built.length === n) {
      if (seenCurrent) {
        answer = built.slice()
        return true
      }
      if (sameAsCurrent()) {
        seenCurrent = true
      }
      return false
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) {
        continue
      }
      // Equal values in the same slot give the same ordering; use only the first unused copy.
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        continue
      }
      used[i] = true
      built.push(sorted[i])
      const done = generate()
      built.pop()
      used[i] = false
      if (done) {
        return true
      }
    }
    return false
  }

  generate()
  if (answer.length === 0) {
    // The current ordering was the last one, so wrap to the first (ascending).
    answer = sorted
  }
  for (let i = 0; i < n; i++) {
    nums[i] = answer[i]
  }
}
