function isMatch(s: string, p: string): boolean {
  const m = s.length
  const n = p.length
  // match[i][j] = the first i characters of s match the first j characters of p.
  const match: boolean[][] = []
  for (let i = 0; i <= m; i++) {
    match.push(new Array(n + 1).fill(false))
  }
  match[0][0] = true
  for (let i = 0; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        // "x*" used zero times: skip both pattern characters.
        let result = match[i][j - 2]
        // "x*" absorbs s[i - 1]: x must match it, and the rest is the same pattern.
        if (!result && i > 0 && charMatches(s[i - 1], p[j - 2])) {
          result = match[i - 1][j]
        }
        match[i][j] = result
      } else if (i > 0 && charMatches(s[i - 1], p[j - 1])) {
        match[i][j] = match[i - 1][j - 1]
      }
    }
  }
  return match[m][n]
}

function charMatches(c: string, patternChar: string): boolean {
  return patternChar === '.' || patternChar === c
}
