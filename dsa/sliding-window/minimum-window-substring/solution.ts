function minWindow(s: string, t: string): string {
  // need[c] = how many more copies of character code c the window still needs.
  // It goes negative when the window holds extra copies.
  const need = new Array(128).fill(0)
  for (let i = 0; i < t.length; i++) {
    need[t.charCodeAt(i)]++
  }
  let missing = t.length // required characters not yet in the window
  let left = 0
  let bestStart = 0
  let bestLength = Infinity

  for (let right = 0; right < s.length; right++) {
    const added = s.charCodeAt(right)
    if (need[added] > 0) {
      missing-- // this copy was still required
    }
    need[added]--

    while (missing === 0) {
      // The window covers t. Record it, then try to make it shorter.
      // Strictly shorter only, so a tie keeps the earlier (leftmost) window.
      const length = right - left + 1
      if (length < bestLength) {
        bestLength = length
        bestStart = left
      }
      const removed = s.charCodeAt(left)
      need[removed]++
      if (need[removed] > 0) {
        missing++ // we just dropped a copy the window needed
      }
      left++
    }
  }

  if (bestLength === Infinity) {
    return ''
  }
  return s.substring(bestStart, bestStart + bestLength)
}
