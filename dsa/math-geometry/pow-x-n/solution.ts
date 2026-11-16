function myPow(x: number, n: number): number {
  // Math.abs(-2^31) is fine in JS; in 32-bit languages widen to 64 bits first.
  let exp = Math.abs(n)
  let base = x
  let result = 1
  while (exp > 0) {
    if (exp % 2 === 1) result *= base
    base *= base
    exp = Math.floor(exp / 2)
  }
  return n < 0 ? 1 / result : result
}
