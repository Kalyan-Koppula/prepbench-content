function checkInclusion(s1: string, s2: string): boolean {
  const m = s1.length
  const need = new Array(26).fill(0)
  for (let i = 0; i < m; i++) {
    need[s1.charCodeAt(i) - 97]++
  }
  // Recount every window of length m from scratch.
  for (let start = 0; start + m <= s2.length; start++) {
    const have = new Array(26).fill(0)
    for (let i = start; i < start + m; i++) {
      have[s2.charCodeAt(i) - 97]++
    }
    let same = true
    for (let c = 0; c < 26; c++) {
      if (have[c] !== need[c]) {
        same = false
        break
      }
    }
    if (same) {
      return true
    }
  }
  return false
}
