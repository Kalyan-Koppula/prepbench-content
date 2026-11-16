// Try lengths from longest to shortest, starts from left to right.
function longestPalindrome(s: string): string {
  const isPal = (lo: number, hi: number) => {
    while (lo < hi) if (s[lo++] !== s[hi--]) return false
    return true
  }
  for (let len = s.length; len > 0; len--)
    for (let start = 0; start + len <= s.length; start++)
      if (isPal(start, start + len - 1)) return s.slice(start, start + len)
  return ''
}
