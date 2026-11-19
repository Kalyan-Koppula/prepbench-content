function checkInclusion(s1: string, s2: string): boolean {
  const m = s1.length
  if (m > s2.length) {
    return false
  }
  // need: letter counts of s1. have: letter counts of the current window of s2.
  const need = new Array(26).fill(0)
  const have = new Array(26).fill(0)
  for (let i = 0; i < m; i++) {
    need[s1.charCodeAt(i) - 97]++
    have[s2.charCodeAt(i) - 97]++
  }
  // matches = how many of the 26 letters have equal counts in need and have.
  let matches = 0
  for (let c = 0; c < 26; c++) {
    if (need[c] === have[c]) {
      matches++
    }
  }

  for (let right = m; right < s2.length; right++) {
    if (matches === 26) {
      return true
    }
    // Slide by one: add s2[right], remove s2[right - m].
    const added = s2.charCodeAt(right) - 97
    if (have[added] === need[added]) {
      matches-- // was equal, is about to change
    }
    have[added]++
    if (have[added] === need[added]) {
      matches++
    }

    const removed = s2.charCodeAt(right - m) - 97
    if (have[removed] === need[removed]) {
      matches--
    }
    have[removed]--
    if (have[removed] === need[removed]) {
      matches++
    }
  }
  return matches === 26
}
