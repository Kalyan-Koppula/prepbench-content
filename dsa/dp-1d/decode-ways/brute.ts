// Try every way to cut the string into valid codes, left to right.
function numDecodings(s: string): number {
  const valid = (code: string) => code[0] !== '0' && Number(code) >= 1 && Number(code) <= 26
  const go = (i: number): number => {
    if (i === s.length) return 1
    let total = 0
    for (const len of [1, 2]) if (i + len <= s.length && valid(s.slice(i, i + len))) total += go(i + len)
    return total
  }
  return go(0)
}
