function countFrom(s: string, i: number): number {
  // Readings of s[i..]: cut off a valid one- or two-digit code and recurse.
  if (i === s.length) {
    return 1
  }
  if (s[i] === '0') {
    return 0 // no code starts with 0
  }
  let total = countFrom(s, i + 1)
  if (i + 1 < s.length) {
    const pair = (s.charCodeAt(i) - 48) * 10 + (s.charCodeAt(i + 1) - 48)
    if (pair <= 26) {
      total += countFrom(s, i + 2)
    }
  }
  return total
}

function numDecodings(s: string): number {
  // Plain recursion: exponential without memoisation.
  return countFrom(s, 0)
}
