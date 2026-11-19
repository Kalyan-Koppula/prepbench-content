function myPow(x: number, n: number): number {
  // Use a wide integer for the exponent: -(-2^31) doesn't fit in 32 bits.
  let exponent = n < 0 ? -n : n
  let base = x
  let result = 1
  // Binary exponentiation: each bit of the exponent decides whether
  // the current power of x (x, x^2, x^4, ...) is part of the product.
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result *= base
    }
    base *= base
    exponent = Math.floor(exponent / 2)
  }
  return n < 0 ? 1 / result : result
}
