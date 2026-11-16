function romanToInt(s: string): number {
  const pairs: Record<string, number> = { CM: 900, CD: 400, XC: 90, XL: 40, IX: 9, IV: 4 }
  const single: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  let i = 0
  while (i < s.length) {
    const two = s.slice(i, i + 2)
    if (two in pairs) {
      total += pairs[two]
      i += 2
    } else {
      total += single[s[i]]
      i++
    }
  }
  return total
}
