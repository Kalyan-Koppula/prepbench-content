function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length
  const n = text2.length
  // lcs[i][j] = LCS length of the first i characters of text1 and the first j of text2.
  // Row 0 and column 0 stand for an empty prefix and stay 0.
  const lcs: number[][] = []
  for (let i = 0; i <= m; i++) {
    lcs.push(new Array(n + 1).fill(0))
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1 // both last characters join the subsequence
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]) // drop one of them
      }
    }
  }
  return lcs[m][n]
}
