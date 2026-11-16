function isMatch(s: string, p: string): boolean {
  const n = p.length
  // match[j] = does the current prefix of s match p[0..j)?  Start with the empty prefix of s.
  let match = new Array(n + 1).fill(false)
  match[0] = true
  for (let j = 1; j <= n; j++) match[j] = match[j - 1] && p[j - 1] === '*'

  for (let i = 1; i <= s.length; i++) {
    const next = new Array(n + 1).fill(false) // next[0] = false: non-empty s vs empty pattern
    for (let j = 1; j <= n; j++) {
      const pc = p[j - 1]
      if (pc === '*') next[j] = next[j - 1] || match[j] // '*' matches empty, or eats s[i-1]
      else next[j] = match[j - 1] && (pc === '?' || pc === s[i - 1])
    }
    match = next
  }
  return match[n]
}
