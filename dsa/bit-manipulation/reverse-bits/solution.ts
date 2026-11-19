function reverseBits(n: number): number {
  let result = 0
  for (let i = 0; i < 32; i++) {
    // Move the lowest bit of n onto the end of result.
    // result * 2 is "shift left by one"; arithmetic keeps the result unsigned.
    result = result * 2 + (n & 1)
    n = n >>> 1 // unsigned shift right (the same operator exists in Java)
  }
  return result
}
