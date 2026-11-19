function isInterleave(s1: string, s2: string, s3: string): boolean {
  const m = s1.length
  const n = s2.length
  if (m + n !== s3.length) {
    return false
  }
  // ok[i][j] = the first i + j characters of s3 interleave
  // the first i characters of s1 and the first j characters of s2.
  const ok: boolean[][] = []
  for (let i = 0; i <= m; i++) {
    ok.push(new Array(n + 1).fill(false))
  }
  ok[0][0] = true
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) {
        continue
      }
      const next = s3[i + j - 1] // the character this cell must account for
      let reachable = false
      if (i > 0 && ok[i - 1][j] && s1[i - 1] === next) {
        reachable = true // it came from s1
      }
      if (j > 0 && ok[i][j - 1] && s2[j - 1] === next) {
        reachable = true // it came from s2
      }
      ok[i][j] = reachable
    }
  }
  return ok[m][n]
}
