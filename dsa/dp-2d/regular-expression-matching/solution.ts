function isMatch(s: string, p: string): boolean {
  const m = s.length
  const n = p.length
  const same = (i: number, j: number) => p[j - 1] === '.' || p[j - 1] === s[i - 1] // s[i-1] vs p[j-1]

  // match[i][j] = s[0..i) matches p[0..j).
  const match: boolean[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false))
  match[0][0] = true
  for (let i = 0; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // Use "x*" zero times, or let it absorb s[i-1] and stay on the same j.
        match[i][j] = match[i][j - 2] || (i > 0 && same(i, j - 1) && match[i - 1][j])
      } else {
        match[i][j] = i > 0 && same(i, j) && match[i - 1][j - 1]
      }
    }
  }
  return match[m][n]
}
