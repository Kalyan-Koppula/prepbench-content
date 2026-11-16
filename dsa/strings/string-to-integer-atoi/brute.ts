function myAtoi(s: string): number {
  const m = /^ *([+-]?)(\d+)/.exec(s)
  if (!m) return 0
  let v = BigInt(m[2])
  if (m[1] === '-') v = -v
  const lo = -(2n ** 31n)
  const hi = 2n ** 31n - 1n
  if (v < lo) v = lo
  if (v > hi) v = hi
  return Number(v)
}
