// Interval DP: isPal[i][j] is true when s[i..j] is a palindrome; count the true cells.
function countSubstrings(s: string): number {
  const n = s.length
  const isPal: boolean[][] = []
  for (let i = 0; i < n; i++) {
    isPal.push(new Array(n).fill(false))
  }
  let count = 0
  for (let length = 1; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      if (s[i] === s[j] && (length <= 2 || isPal[i + 1][j - 1])) {
        isPal[i][j] = true
        count++
      }
    }
  }
  return count
}
