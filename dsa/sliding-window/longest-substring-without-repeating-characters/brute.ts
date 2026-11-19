function lengthOfLongestSubstring(s: string): number {
  let best = 0
  for (let start = 0; start < s.length; start++) {
    // Extend from start until a character repeats: everything before that
    // repeat is the longest valid substring beginning at start.
    const seen = new Set<string>()
    for (let end = start; end < s.length; end++) {
      if (seen.has(s[end])) {
        break
      }
      seen.add(s[end])
      const length = end - start + 1
      if (length > best) {
        best = length
      }
    }
  }
  return best
}
