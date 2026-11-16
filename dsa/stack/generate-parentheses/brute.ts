function generateParenthesis(n: number): string[] {
  const result: string[] = []
  // Every bitmask of length 2n is a candidate string; keep the balanced ones.
  for (let mask = 0; mask < 1 << (2 * n); mask++) {
    let s = ''
    let balance = 0
    for (let i = 0; i < 2 * n && balance >= 0; i++) {
      const open = (mask >> i) & 1
      s += open ? '(' : ')'
      balance += open ? 1 : -1
    }
    if (balance === 0 && s.length === 2 * n) result.push(s)
  }
  return result
}
