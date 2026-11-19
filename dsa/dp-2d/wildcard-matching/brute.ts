// Simulate the pattern as an automaton: active[k] says the first k pattern
// characters can match what has been read so far. Read s one character at a time.
function isMatch(s: string, p: string): boolean {
  const n = p.length
  let active = new Array(n + 1).fill(false)
  active[0] = true
  skipStars(p, active)
  for (let i = 0; i < s.length; i++) {
    const next = new Array(n + 1).fill(false)
    for (let k = 0; k < n; k++) {
      if (!active[k]) {
        continue
      }
      if (p[k] === '*') {
        next[k] = true // the star absorbs s[i] and stays active
      } else if (p[k] === '?' || p[k] === s[i]) {
        next[k + 1] = true
      }
    }
    skipStars(p, next)
    active = next
  }
  return active[n]
}

// A star may match nothing, so being before a star also means being after it.
function skipStars(p: string, active: boolean[]): void {
  for (let k = 0; k < p.length; k++) {
    if (active[k] && p[k] === '*') {
      active[k + 1] = true
    }
  }
}
