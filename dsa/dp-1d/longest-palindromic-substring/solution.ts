function longestPalindrome(s: string): string {
  let bestStart = 0
  let bestLen = 1

  // Grow outward from centre [lo, hi] and keep the result if strictly longer.
  const expand = (lo: number, hi: number) => {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      lo--
      hi++
    }
    const len = hi - lo - 1
    if (len > bestLen) {
      bestLen = len
      bestStart = lo + 1
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i) // odd length, centred on s[i]
    expand(i, i + 1) // even length, centred between s[i] and s[i+1]
  }
  return s.slice(bestStart, bestStart + bestLen)
}
