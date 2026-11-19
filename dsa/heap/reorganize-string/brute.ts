function reorganizeString(s: string): string {
  // Alternative without a heap: place the most frequent letter on even
  // positions first, then fill the remaining even and odd positions.
  const n = s.length
  const counts = new Array(26).fill(0)
  for (let i = 0; i < n; i++) {
    counts[s.charCodeAt(i) - 97]++
  }
  let most = 0
  for (let c = 1; c < 26; c++) {
    if (counts[c] > counts[most]) {
      most = c
    }
  }
  if (counts[most] > Math.floor((n + 1) / 2)) {
    return '' // too many copies to keep apart
  }
  const result: string[] = new Array(n).fill('')
  let position = 0
  while (counts[most] > 0) {
    result[position] = String.fromCharCode(97 + most)
    counts[most]--
    position += 2
  }
  for (let c = 0; c < 26; c++) {
    while (counts[c] > 0) {
      if (position >= n) {
        position = 1 // even slots are full: switch to odd ones
      }
      result[position] = String.fromCharCode(97 + c)
      counts[c]--
      position += 2
    }
  }
  return result.join('')
}
