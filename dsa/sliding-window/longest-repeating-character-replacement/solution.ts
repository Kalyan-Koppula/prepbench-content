function characterReplacement(s: string, k: number): number {
  const count = new Array(26).fill(0)
  let left = 0
  // The highest count of a single letter seen in any window so far.
  // It is never lowered: only a window with a higher count can beat the best.
  let maxCount = 0
  let best = 0

  for (let right = 0; right < s.length; right++) {
    const added = s.charCodeAt(right) - 65
    count[added]++
    if (count[added] > maxCount) {
      maxCount = count[added]
    }

    // Too many letters to replace. Drop one from the left, so the window
    // slides at its current length instead of growing.
    const length = right - left + 1
    if (length - maxCount > k) {
      count[s.charCodeAt(left) - 65]--
      left++
    }

    const windowLength = right - left + 1
    if (windowLength > best) {
      best = windowLength
    }
  }
  return best
}
