function isMatch(s: string, p: string): boolean {
  const m = s.length
  const n = p.length
  // match[i][j] = the first i characters of s match the first j characters of p.
  const match: boolean[][] = []
  for (let i = 0; i <= m; i++) {
    match.push(new Array(n + 1).fill(false))
  }
  match[0][0] = true
  for (let j = 1; j <= n; j++) {
    match[0][j] = match[0][j - 1] && p[j - 1] === '*' // only stars match an empty s
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const pc = p[j - 1]
      if (pc === '*') {
        // The star matches nothing (left), or it also covers s[i - 1] (above).
        match[i][j] = match[i][j - 1] || match[i - 1][j]
      } else if (pc === '?' || pc === s[i - 1]) {
        match[i][j] = match[i - 1][j - 1]
      }
    }
  }
  return match[m][n]
}
