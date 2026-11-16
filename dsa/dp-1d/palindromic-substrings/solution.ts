function countSubstrings(s: string): number {
  let count = 0
  const expand = (lo: number, hi: number) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      count++ // s[lo..hi] is a palindrome
      lo--
      hi++
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i) // odd lengths
    expand(i, i + 1) // even lengths
  }
  return count
}
