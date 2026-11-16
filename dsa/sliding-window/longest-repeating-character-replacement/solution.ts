function characterReplacement(s: string, k: number): number {
  const count = new Array(26).fill(0)
  let left = 0
  let maxFreq = 0
  let best = 0
  for (let right = 0; right < s.length; right++) {
    const c = s.charCodeAt(right) - 65
    count[c]++
    maxFreq = Math.max(maxFreq, count[c])
    // Too many letters to replace: slide the window (it never shrinks).
    if (right - left + 1 - maxFreq > k) {
      count[s.charCodeAt(left) - 65]--
      left++
    }
    best = Math.max(best, right - left + 1)
  }
  return best
}
