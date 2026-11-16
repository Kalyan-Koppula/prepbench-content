// Top-down recursion over (i, j) with exact BigInt arithmetic.
function numDistinct(s: string, t: string): number {
  const memo = new Map<number, bigint>()
  const count = (i: number, j: number): bigint => {
    if (j === t.length) return BigInt(1)
    if (s.length - i < t.length - j) return BigInt(0)
    const key = i * (t.length + 1) + j
    const hit = memo.get(key)
    if (hit !== undefined) return hit
    let total = count(i + 1, j) // skip s[i]
    if (s[i] === t[j]) total += count(i + 1, j + 1) // match s[i] with t[j]
    memo.set(key, total)
    return total
  }
  return Number(count(0, 0))
}
