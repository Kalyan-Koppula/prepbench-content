function lengthOfLongestSubstring(s: string): number {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const seen = new Set<string>()
    for (let j = i; j < s.length && !seen.has(s[j]); j++) {
      seen.add(s[j])
      best = Math.max(best, j - i + 1)
    }
  }
  return best
}
