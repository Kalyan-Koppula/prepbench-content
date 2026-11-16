function characterReplacement(s: string, k: number): number {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const count = new Array(26).fill(0)
    let maxFreq = 0
    for (let j = i; j < s.length; j++) {
      const c = s.charCodeAt(j) - 65
      count[c]++
      maxFreq = Math.max(maxFreq, count[c])
      if (j - i + 1 - maxFreq <= k) best = Math.max(best, j - i + 1)
    }
  }
  return best
}
