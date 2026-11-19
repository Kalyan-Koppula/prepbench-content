function shortestPalindrome(s: string): string {
  const n = s.length
  let reversed = ''
  for (let i = n - 1; i >= 0; i--) {
    reversed += s[i]
  }
  // In s + '#' + reversed, the longest prefix that is also a suffix is the
  // longest palindromic prefix of s. The '#' stops a match crossing the middle.
  const combined = s + '#' + reversed
  const lps = new Array(combined.length).fill(0)
  let length = 0
  for (let i = 1; i < combined.length; i++) {
    while (length > 0 && combined[i] !== combined[length]) {
      length = lps[length - 1]
    }
    if (combined[i] === combined[length]) {
      length++
    }
    lps[i] = length
  }
  const palindromicPrefix = lps[combined.length - 1]
  // Mirror the rest of s in front of it.
  return reversed.substring(0, n - palindromicPrefix) + s
}
