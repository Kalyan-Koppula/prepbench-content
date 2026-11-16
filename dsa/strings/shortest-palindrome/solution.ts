function shortestPalindrome(s: string): string {
  const rev = s.split('').reverse().join('')
  const t = s + '#' + rev
  const lps = new Array<number>(t.length).fill(0)
  for (let i = 1, len = 0; i < t.length; i++) {
    while (len > 0 && t[i] !== t[len]) len = lps[len - 1]
    if (t[i] === t[len]) len++
    lps[i] = len
  }
  // longest prefix of s that is a suffix of rev = longest palindromic prefix
  const k = t.length ? lps[t.length - 1] : 0
  return rev.slice(0, s.length - k) + s
}
