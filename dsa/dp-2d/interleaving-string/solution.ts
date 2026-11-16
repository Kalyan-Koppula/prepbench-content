function isInterleave(s1: string, s2: string, s3: string): boolean {
  const m = s1.length
  const n = s2.length
  if (m + n !== s3.length) return false

  // ok[j] (for the current i) = s3[0..i+j) is an interleaving of s1[0..i) and s2[0..j).
  const ok = new Array(n + 1).fill(false)
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 && j === 0) ok[j] = true
      else {
        const fromS1 = i > 0 && ok[j] && s1[i - 1] === s3[i + j - 1] // ok[j] still holds row i-1
        const fromS2 = j > 0 && ok[j - 1] && s2[j - 1] === s3[i + j - 1]
        ok[j] = fromS1 || fromS2
      }
    }
  }
  return ok[n]
}
