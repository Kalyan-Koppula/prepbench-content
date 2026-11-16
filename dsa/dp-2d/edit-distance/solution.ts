function minDistance(word1: string, word2: string): number {
  const m = word1.length
  const n = word2.length
  // prev[j] = dp[i-1][j]; row 0 is "insert j characters".
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1)
    cur[0] = i // delete all i characters
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) cur[j] = prev[j - 1]
      else cur[j] = 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]) // replace, delete, insert
    }
    prev = cur
  }
  return prev[n]
}
