function romanToInt(s: string): number {
  const value: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const v = value[s[i]]
    // a smaller symbol before a larger one is subtracted
    if (i + 1 < s.length && value[s[i + 1]] > v) total -= v
    else total += v
  }
  return total
}
