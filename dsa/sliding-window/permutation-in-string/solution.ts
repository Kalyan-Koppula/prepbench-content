function checkInclusion(s1: string, s2: string): boolean {
  const m = s1.length
  if (m > s2.length) return false
  const need = new Array(26).fill(0)
  const have = new Array(26).fill(0)
  for (let i = 0; i < m; i++) {
    need[s1.charCodeAt(i) - 97]++
    have[s2.charCodeAt(i) - 97]++
  }
  let matches = 0
  for (let c = 0; c < 26; c++) if (need[c] === have[c]) matches++

  // Adjust `matches` as one letter's count changes by `delta`.
  const update = (c: number, delta: number) => {
    if (have[c] === need[c]) matches--
    have[c] += delta
    if (have[c] === need[c]) matches++
  }

  for (let right = m; right < s2.length; right++) {
    if (matches === 26) return true
    update(s2.charCodeAt(right) - 97, 1)
    update(s2.charCodeAt(right - m) - 97, -1)
  }
  return matches === 26
}
