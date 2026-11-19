function longestPalindrome(s: string): string {
  let bestStart = 0
  let bestLength = 1
  for (let center = 0; center < s.length; center++) {
    // Odd length: centred on s[center].
    let length = expandLength(s, center, center)
    if (length > bestLength) {
      bestLength = length
      bestStart = center - Math.floor((length - 1) / 2)
    }
    // Even length: centred between s[center] and s[center + 1].
    length = expandLength(s, center, center + 1)
    if (length > bestLength) {
      bestLength = length
      bestStart = center - Math.floor((length - 1) / 2)
    }
  }
  return s.substring(bestStart, bestStart + bestLength)
}

// Grow outward while the ends match; return the length of the palindrome found.
function expandLength(s: string, left: number, right: number): number {
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    left--
    right++
  }
  return right - left - 1
}
