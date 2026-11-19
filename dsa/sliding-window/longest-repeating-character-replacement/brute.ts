function characterReplacement(s: string, k: number): number {
  let best = 0
  for (let start = 0; start < s.length; start++) {
    // Grow the substring from start, keeping its letter counts up to date.
    const count = new Array(26).fill(0)
    let maxCount = 0
    for (let end = start; end < s.length; end++) {
      const code = s.charCodeAt(end) - 65
      count[code]++
      if (count[code] > maxCount) {
        maxCount = count[code]
      }
      // Keep the most common letter and replace the rest.
      const length = end - start + 1
      if (length - maxCount <= k && length > best) {
        best = length
      }
    }
  }
  return best
}
