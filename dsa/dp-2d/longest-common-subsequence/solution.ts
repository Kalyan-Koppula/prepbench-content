function longestCommonSubsequence(text1: string, text2: string): number {
  // Keep the shorter string along the row to use O(min(m, n)) space.
  if (text2.length > text1.length) [text1, text2] = [text2, text1]
  const n = text2.length
  let prev = new Array(n + 1).fill(0) // dp row i - 1
  for (let i = 1; i <= text1.length; i++) {
    const cur = new Array(n + 1).fill(0) // dp row i; cur[0] = 0 (empty prefix)
    for (let j = 1; j <= n; j++) {
      cur[j] = text1[i - 1] === text2[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1])
    }
    prev = cur
  }
  return prev[n]
}
