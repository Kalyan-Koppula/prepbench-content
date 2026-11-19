function numDistinct(s: string, t: string): number {
  const m = s.length
  const n = t.length
  // ways[i][j] = number of ways to form the first j characters of t
  // from the first i characters of s.
  const ways: number[][] = []
  for (let i = 0; i <= m; i++) {
    ways.push(new Array(n + 1).fill(0))
  }
  for (let i = 0; i <= m; i++) {
    ways[i][0] = 1 // the empty target: delete everything
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      ways[i][j] = ways[i - 1][j] // don't use s[i - 1]
      if (s[i - 1] === t[j - 1]) {
        ways[i][j] += ways[i - 1][j - 1] // use it as t[j - 1]
      }
    }
  }
  return ways[m][n]
}
