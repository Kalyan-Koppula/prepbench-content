function numDistinct(s: string, t: string): number {
  const n = t.length
  if (n > s.length) return 0
  // ways[j] = ways to form t[0..j) from the prefix of s processed so far.
  const ways = new Array(n + 1).fill(0)
  ways[0] = 1 // the empty target: delete everything
  for (const ch of s) {
    // Downward so ways[j - 1] is still the value before this character.
    for (let j = n; j >= 1; j--) {
      if (t[j - 1] === ch) ways[j] += ways[j - 1]
    }
  }
  return ways[n]
}
