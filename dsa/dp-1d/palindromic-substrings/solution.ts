function countSubstrings(s: string): number {
  let count = 0
  for (let center = 0; center < s.length; center++) {
    count += countFrom(s, center, center) // odd lengths
    count += countFrom(s, center, center + 1) // even lengths
  }
  return count
}

// Every successful outward step is one more palindrome with this centre.
function countFrom(s: string, left: number, right: number): number {
  let found = 0
  while (left >= 0 && right < s.length && s[left] === s[right]) {
    found++
    left--
    right++
  }
  return found
}
